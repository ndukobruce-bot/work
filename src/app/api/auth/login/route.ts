import {NextRequest,NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {verifyPassword} from '@/lib/password';
import {createSession,SESSION_COOKIE} from '@/lib/auth-session';
const attempts=new Map<string,{count:number;at:number}>();
export async function POST(request:NextRequest){
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]||'local';const now=Date.now();const previous=attempts.get(ip);
 if(previous&&now-previous.at<60000&&previous.count>=12)return NextResponse.json({error:'Too many attempts. Wait a minute and try again.'},{status:429});
 attempts.set(ip,{count:previous&&now-previous.at<60000?previous.count+1:1,at:now});
 let body:{email?:string;password?:string};try{body=await request.json();}catch{return NextResponse.json({error:'Invalid request.'},{status:400});}
 const email=body.email?.toLowerCase().trim();if(!email||!body.password)return NextResponse.json({error:'Email or password is incorrect.'},{status:401});
 const user=await prisma.user.findUnique({where:{email}});
 const valid=!!user&&await verifyPassword(body.password,user.passwordHash);
 if(!valid||!user||user.accountStatus!=='ACTIVE')return NextResponse.json({error:'Email or password is incorrect.'},{status:401});
 if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)return NextResponse.json({error:'Authentication is not configured.'},{status:503});
 const token=await createSession(user.id,user.authVersion);
 const response=NextResponse.json({ok:true,user:{name:user.name,email:user.email}});
 response.cookies.set(SESSION_COOKIE,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*12});
 return response;
}
