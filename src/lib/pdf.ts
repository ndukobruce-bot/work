function pdfEscape(value:string){return value.replace(/[^\x20-\x7E]/g,' ').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');}
export function makePdf(title:string,text:string){
 const lines=[title,'',...text.split(/\r?\n/)].flatMap(line=>{const out:string[]=[];for(let i=0;i<line.length;i+=88)out.push(line.slice(i,i+88));return out.length?out:[''];}).slice(0,52);
 const commands=['BT','/F1 11 Tf','50 750 Td','14 TL',...lines.flatMap((line,i)=>i?['T*',`(${pdfEscape(line)}) Tj`]:[`(${pdfEscape(line)}) Tj`]),'ET'].join('\n');
 const objects=[
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(commands,'ascii')} >>\nstream\n${commands}\nendstream`
 ];
 let output='%PDF-1.4\n',offsets=[0];
 objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(output,'ascii'));output+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
 const xref=Buffer.byteLength(output,'ascii');output+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(x=>`${String(x).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return Buffer.from(output,'ascii');
}
