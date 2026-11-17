import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCallback);
const KEYLEN=64;
export async function hashPassword(password:string){
 const salt=randomBytes(16).toString('hex');
 const key=await scrypt(password,salt,KEYLEN) as Buffer;
 return `scrypt$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password:string,encoded:string){
 const [scheme,salt,hex]=encoded.split('$');
 if(scheme!=='scrypt'||!salt||!hex)return false;
 const actual=await scrypt(password,salt,KEYLEN) as Buffer;
 const expected=Buffer.from(hex,'hex');
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
