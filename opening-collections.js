/* Lien cap CDSP: verified pre-BIDV collection register, stored locally only. */
function openingText(v){return String(v??'').trim();}
function openingKey(student,fee){return student.code+'|'+fee;}
function openingFee(v){const s=slug(v);if(s==='bhyt'||s.includes('bao hiem y te'))return 'insurance';if(s==='bhtt'||s.includes('bao hiem than the'))return 'mandatory';return '';}
function openingName(f){return f==='insurance'?'Bảo hiểm y tế':'Bảo hiểm thân thể';}
function openingDate(v){const d=normalizeDate(v);return /^\\d{4}-\\d{2}-\\d{2}$/.test(d)?d:'';}
function openingHeaderMap(headers){
 const h=headers.map(v=>slug(v));const ix=(parts)=>h.findIndex(v=>parts.some(p=>v===p||v.includes(p)));
 return {cl:ix(['lop']),name:ix(['ho va ten','ho ten']),birth:ix(['ngay sinh']),fee:ix(['khoan thu']),amount:ix(['so tien du kien','so tien']),date:ix(['ngay thu thuc te','ngay thu']),confirmed:ix(['xac nhan']),reference:ix(['so chung tu','tham chieu']),note:ix(['ghi chu'])};
}
async function openingRecords(){const r=await request('meta','get','preBidvCollections');return Array.isArray(r?.items)?r.items:[];}
function openingReviewStatus(confirmed,ref){const v=slug(confirmed);return /^(xac nhan|da thu|confirmed|yes|co|1)$/.test(v)&&!!ref;}
async function importOpeningCollections(file){
 if(!file)return;const rows=await readRows(file);if(!rows?.length)throw new Error('File xác nhận không có dữ liệu.');
 const header=openingHeaderMap(rows[0]),required=['cl','name','birth','fee','amount','confirmed','reference'];
 if(required.some(k=>header[k]<0))throw new Error('Thiếu cột Lớp, Họ và tên, Ngày sinh, Khoản thu, Số tiền, Xác nhận hoặc Số chứng từ.');
 const students=await all('students'),stored=await all('transactions'),reconciled=reconcileTransactions(students,stored),paid=confirmedPaymentMap(reconciled);
 const lookup=new Map();for(const s of students){const k=[slug(s.className),slug(s.name),normalizeDate(s.birthDate)].join('|');if(lookup.has(k))lookup.set(k,null);else lookup.set(k,s);}
 const old=await openingRecords(),recordMap=new Map(old.map(x=>[x.key,x]));const pending=[],toCreate=[];let unconfirmed=0,invalid=0,duplicates=0,verified=0;
 for(const [idx,row] of rows.slice(1).entries()){
   if(!row.some(v=>openingText(v)))continue;
   const at=k=>openingText(header[k]>=0?row[header[k]]:'');
   const confirmation=at('confirmed'),reference=at('reference');
   if(!openingReviewStatus(confirmation,reference)){unconfirmed++;continue;}
   const date=at('date')?openingDate(at('date')):'';
   if(at('date')&&!date){invalid++;continue;}
   if(date&&date>new Date().toISOString().slice(0,10)){invalid++;continue;}
   const k=[slug(at('cl')),slug(at('name')),normalizeDate(at('birth'))].join('|');
   const student=lookup.get(k),fee=openingFee(at('fee')),amount=parseMoneyInput(at('amount'));
   if(!student||!fee||amount<=0){invalid++;continue;}
   const key=openingKey(student,fee);
   if(recordMap.has(key)){duplicates++;continue;}
   const item=studentDueItems(student).find(x=>x.category===fee&&Number(x.amount)===amount);
   const record={key,studentCode:student.code,studentName:student.name,className:student.className,birthDate:student.birthDate,fee,feeName:openingName(fee),amount,date,reference,note:at('note'),fileName:file.name,verifiedAt:new Date().toISOString(),mode:item?'matched_due':'historical_only'};
   if(item&&paid.has(student.code+'|'+item.id)){duplicates++;continue;}
   pending.push(record);
   if(item)toCreate.push({student,item,record});
 }
 if(!pending.length){await renderOpeningCollections();toast('Không có khoản đã xác minh mới. Chưa xác nhận: '+unconfirmed+'; cần sửa: '+invalid+'; trùng: '+duplicates,true);return;}
 const sum=pending.reduce((a,x)=>a+x.amount,0);
 if(!window.confirm('Xác nhận ghi nhận '+pending.length+' khoản thu TRƯỚC BIDV, tổng '+money(sum)+'?\\nChỉ tiếp tục nếu đã đối chiếu chứng từ thực tế. Các khoản không có nghĩa vụ trong web sẽ lưu ở sổ lịch sử riêng, không tạo giao dịch BIDV.'))return;
 const timestamp=new Date().toISOString(),txs=toCreate.map(({student,item,record})=>({
  id:'opening:'+student.code+':'+record.fee,ref:record.reference,date:record.date,content:'Thu trước triển khai BIDV – '+record.feeName,amount:record.amount,
  feeCategory:item.category,feeDetail:item.name,reportedStudentCode:student.code,reportedPaymentCode:item.paymentCode||student.code,
  bankStatus:'thanh cong',studentCode:student.code,studentName:student.name,sourceFile:file.name,importedAt:timestamp,matched:true,
  sourceType:'manual_collection',paymentChannel:'pre_bidv',manualDueItemId:item.id,payerName:'Nhà trường xác nhận',note:record.note
 }));
 const combined=reconcileTransactions(students,[...stored,...txs]),validNew=new Set(combined.filter(t=>t.paymentStatus==='valid').map(t=>t.id));
 if(txs.some(t=>!validNew.has(t.id)))throw new Error('Có khoản trùng hoặc lệch số tiền khi đối soát. Chưa ghi nhận; hãy kiểm tra dữ liệu.');
 await putMany('transactions',txs);
 await request('meta','put',{key:'preBidvCollections',items:[...old,...pending]});
 await request('history','put',{id:crypto.randomUUID(),kind:'Đối soát thu trước BIDV',fileName:file.name,rows:rows.length-1,imported:pending.length,detail:pending.length+' khoản; '+money(sum)+'; '+toCreate.length+' khoản khớp nghĩa vụ trong web',at:timestamp});
 await refresh();toast('Đã xác nhận '+pending.length+' khoản thu trước BIDV. Bỏ qua '+unconfirmed+' dòng chưa xác nhận, '+invalid+' dòng lỗi, '+duplicates+' dòng trùng.');
}
async function renderOpeningCollections(){
 const el=document.getElementById('openingCollectionsStatus'),tbody=document.getElementById('openingCollectionsRows');if(!el||!tbody)return;
 const records=await openingRecords(),total=records.reduce((s,x)=>s+Number(x.amount||0),0),linked=records.filter(x=>x.mode==='matched_due').length;
 el.textContent=records.length+' khoản đã xác nhận trước BIDV · '+money(total)+' · '+linked+' khoản khớp nghĩa vụ web. Không bao gồm dòng chưa được nhà trường xác nhận.';
 tbody.innerHTML=records.length?records.slice(-120).reverse().map(r=>'<tr><td>'+escapeHTML(r.className)+'</td><td>'+escapeHTML(r.studentName)+'</td><td>'+escapeHTML(r.feeName)+'</td><td>'+escapeHTML(money(r.amount))+'</td><td>'+escapeHTML(r.date||'Chưa có ngày')+'</td><td>'+escapeHTML(r.reference)+'</td><td>'+escapeHTML(r.mode==='matched_due'?'Đã đối soát món':'Sổ lịch sử')+'</td></tr>').join(''):'<tr><td colspan="7" class="empty-cell">Chưa có món thu trước BIDV được xác nhận.</td></tr>';
}
function wireOpeningCollections(){
 const input=document.getElementById('openingCollectionsInput'),btn=document.getElementById('openingCollectionsButton');
 if(!input||!btn)return;btn.onclick=()=>input.click();
 input.onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{await importOpeningCollections(file);}catch(err){console.error(err);toast(err.message||'Không thể nhập bảng xác nhận.',true);}};
}
