/* Parent portal export adapter. No automatic transmission of student data. */
(() => {
  const SCHOOL_ID='LIENCAPCDSP';
  const PARENT_PORTAL='https://school-parent-dev.tuananh0001.workers.dev/';
  const COURSE='2026-2027';
  function text(v){return String(v??'').trim();}
  function iso(v){const s=text(v);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:'';}
  function simulate(t){return /^(TEST|DEMO|MO PHONG|GIA LAP)/i.test(text(t.ref||t.sourceFile||t.content||'')) || /TESTBIDV|GIA_LAP/i.test([t.ref,t.sourceFile,t.content].join('|'));}
  async function buildSnapshot(){
    if(typeof all!=='function'||typeof studentDueItems!=='function'||typeof reconcileTransactions!=='function')throw Error('Chưa mở được dữ liệu quản lý trường.');
    const [students,stored]=await Promise.all([all('students'),all('transactions')]);
    if(!students.length)throw Error('Chưa có danh sách học sinh.');
    const reconciled=reconcileTransactions(students,stored);
    const test=reconciled.filter(simulate);
    const valid=reconciled.filter(t=>t.paymentStatus==='valid');
    const items=students.filter(s=>s.status!=='inactive').map(s=>({
      student_id:text(s.code),
      name:text(s.name),
      class_name:text(s.className),
      birth_date:iso(s.birthDate),
      opening_status:(typeof isSchoolConfirmedPreBidv==='function'&&isSchoolConfirmedPreBidv(s))?'COMPLETED_BEFORE_BIDV':'NOT_RECORDED',
      charges:studentDueItems(s).filter(x=>x.amount>0).map(x=>({
        charge_id:text(x.id),
        category:text(x.category),
        name:text(x.name),
        amount_due:Number(x.amount),
        payment_reference:text(x.paymentCode||x.qrAccountNumber),
        period:'2026-2027',
        qr_status:'PENDING_VERIFICATION',
        qr_payload:null
      }))
    }));
    const payments=valid.filter(t=>!simulate(t)).map(t=>{
      const student=students.find(s=>s.code===t.studentCode);
      const target=new Set(t.matchedDueItemIds||[]);
      if(t.matchedDueItemId)target.add(t.matchedDueItemId);
      return {
        reference:text(t.ref||t.id),
        student_id:text(t.studentCode),
        amount:Number(t.amount),
        paid_at:text(t.date),
        allocations:student?studentDueItems(student).filter(item=>target.has(item.id)).map(item=>({charge_id:item.id,amount:Number(item.amount)})):[]
      };
    });
    if(items.some(s=>!s.student_id||!s.name||!s.class_name||!s.birth_date))throw Error('Có hồ sơ thiếu mã, tên, lớp hoặc ngày sinh. Cần hoàn thiện trước khi đồng bộ.');
    return {
      schema:'school-parent-sync/2',
      school_id:SCHOOL_ID,school_name:'Trường Phổ thông Liên cấp Cao đẳng Sư phạm Quảng Trị',
      academic_year:COURSE,generated_at:new Date().toISOString(),
      status:'DRAFT_REQUIRES_APPROVAL',
      students:items,payments,
      validation:{simulated_transactions:test.length,publish_blocked:test.length>0,opening_completed:items.filter(s=>s.opening_status==='COMPLETED_BEFORE_BIDV').length,
        note:'Chưa duyệt công bố. Không gửi tự động. QR chỉ hiển thị khi đã có nguồn được kiểm chứng.'}
    };
  }
  function download(content,filename){
    const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function init(){
    const btn=document.getElementById('parentSyncExport'),msg=document.getElementById('parentSyncMessage');
    if(!btn)return;
    btn.addEventListener('click',async()=>{
      btn.disabled=true;try{
        const s=await buildSnapshot();
        if(s.validation.publish_blocked){msg.textContent='Cảnh báo: Có '+s.validation.simulated_transactions+' giao dịch TEST/giả lập. Gói này chỉ để kiểm tra; phải khôi phục dữ liệu thật trước khi công bố lên cổng phụ huynh.';}
        else msg.textContent='Đã xuất gói dữ liệu chờ duyệt. Hãy chuyển tệp qua màn hình quản trị có xác thực Cloudflare Access; dữ liệu chưa gửi lên cổng.';
        if(!confirm('Xuất gói chứa thông tin học sinh và khoản thu ra file JSON để cán bộ quản trị duyệt đồng bộ? Lưu tệp ở nơi an toàn.'))return;
        download(s,'LIENCAPCDSP_PARENT_SYNC_DRAFT_'+new Date().toISOString().slice(0,10)+'.json');
      }catch(e){msg.textContent='Không thể xuất: '+(e?.message||e);}
      finally{btn.disabled=false;}
    });
    const link=document.getElementById('parentPortalLink');
    if(link)link.href=PARENT_PORTAL;
  }
  document.addEventListener('DOMContentLoaded',init);
})();