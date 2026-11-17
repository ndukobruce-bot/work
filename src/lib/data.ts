export type Task={id:string;title:string;field:string;rewardCents:number;hours:number;level:string;difficulty:string;deadline:string;slots:number;description:string;format:string};
export const fields:string[]=[];
export type CompletedTask={slug:string;title:string;field:string;date:string;earned:number;score:number};
export const completed:CompletedTask[]=[];
export const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(cents/100);
