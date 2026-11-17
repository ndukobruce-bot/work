import {NextRequest,NextResponse} from 'next/server';import {getCurrentUser} from '@/lib/auth-session';import {prisma} from '@/lib/prisma';
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:'Not signed in.'},{status:401});
 const {id}=await params;const order=id;if(!order)return NextResponse.json({error:'Task not found.'},{status:404});
 let body:{text?:string;aiDisclosure?:boolean};try{body=await request.json();}catch{return NextResponse.json({error:'Invalid submission.'},{status:400});}
 const text=body.text?.trim();if(!text||text.length<20)return NextResponse.json({error:'Add at least 20 characters before submitting.'},{status:400});if(body.aiDisclosure!==true)return NextResponse.json({error:'Confirm the originality and AI disclosure declaration.'},{status:400});
 const task=await prisma.task.findUnique({where:{id:order}});if(!task)return NextResponse.json({error:'Task not found.'},{status:404});
 const current=await prisma.taskAssignment.findUnique({where:{userId_taskId:{userId:user.id,taskId:task.id}}});
 const assignment=await prisma.$transaction(async(tx)=>{
  if(!current||!['SUBMITTED','UNDER_REVIEW','REVISION_REQUESTED'].includes(current.status))await tx.wallet.update({where:{userId:user.id},data:{pendingCents:{increment:task.rewardCents}}});
  const saved=await tx.taskAssignment.upsert({where:{userId_taskId:{userId:user.id,taskId:task.id}},update:{status:'UNDER_REVIEW',submittedAt:new Date(),earnedCents:task.rewardCents,submissionText:text,submissionUrl:`/api/assignments/task-${order}/pdf`},create:{userId:user.id,taskId:task.id,status:'UNDER_REVIEW',submittedAt:new Date(),earnedCents:task.rewardCents,submissionText:text,submissionUrl:`/api/assignments/task-${order}/pdf`}});
  await tx.task.update({where:{id:task.id},data:{status:'UNDER_REVIEW'}});
  return saved;
 });
 return NextResponse.json({ok:true,status:assignment.status,assignmentId:assignment.id});
}
