'use strict';
const email='lizeqi@bjmu.edu.cn';
const copyButton=document.getElementById('copy-email');
copyButton.addEventListener('click',async()=>{
 const status=document.getElementById('copy-status');
 try{
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(email);}
  else{
   const field=document.createElement('textarea');field.value=email;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();
   const copied=document.execCommand('copy');field.remove();copyButton.focus();if(!copied)throw new Error('copy unavailable');
  }
  status.textContent='邮箱已复制：'+email;
 }catch{status.textContent='请选中邮箱地址复制，或点击邮箱直接发送邮件。';}
});
document.getElementById('print-profile').addEventListener('click',()=>window.print());
