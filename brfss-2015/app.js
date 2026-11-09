'use strict';
const D=window.PROJECT_DATA;
const $=id=>document.getElementById(id);
const pct=v=>v===null?'—':(v*100).toFixed(1)+'%';
const notes=['训练集加权阳性比例','基础人口学信息','增加五类健康行为','相同九项特征'];
$('model-table').innerHTML=D.metrics.map((m,i)=>`<tr class="${i===2?'highlight':''}"><td>${m.model}</td><td>${m.auc.toFixed(4)}</td><td>${m.ap.toFixed(4)}</td><td>${m.brier.toFixed(4)}</td><td>${notes[i]}</td></tr>`).join('');
let selectedRow=null;
function renderThreshold(exact=false){
 const name=$('model-select').value;
 const m=D.metrics.find(m=>m.model===name);
 const target=exact?m.threshold:Number($('threshold-range').value)/100;
 selectedRow=D.thresholds[name].reduce((best,r)=>Math.abs(r.threshold-target)<Math.abs(best.threshold-target)?r:best);
 $('threshold-range').value=selectedRow.threshold*100;
 $('threshold-output').value=selectedRow.threshold.toFixed(exact?4:2);
 $('reset-threshold').textContent=name==='无信息基线'?'恢复基线阈值 0.5':'恢复验证集阈值';
 for(const key of ['sensitivity','specificity','ppv','accuracy'])$(key).textContent=pct(selectedRow[key]);
 $('balanced').textContent=pct(selectedRow.balanced_accuracy);
 renderMatrix();
 $('live-summary').textContent=`阈值${selectedRow.threshold.toFixed(4)}，灵敏度${pct(selectedRow.sensitivity)}，特异度${pct(selectedRow.specificity)}，阳性预测值${pct(selectedRow.ppv)}`;
}
function renderMatrix(){
 const weighted=$('matrix-mode').value==='weighted';
 const values=weighted?selectedRow.weighted_per1000:selectedRow.counts;
 ['tn','fp','fn','tp'].forEach((key,i)=>$(key).textContent=values[i].toLocaleString('zh-CN',{minimumFractionDigits:weighted?1:0,maximumFractionDigits:weighted?1:0}));
 $('matrix-note').textContent=weighted?'按测试集调查权重折算为每 1,000 人，四格合计约 1,000；非实际人数。':'四格为实际测试记录数，合计 61,537。上方灵敏度等指标仍使用调查权重，不能直接由此人数表相除复算。';
}
$('model-select').addEventListener('change',()=>renderThreshold(true));
$('threshold-range').addEventListener('input',()=>renderThreshold(false));
$('reset-threshold').addEventListener('click',()=>renderThreshold(true));
$('matrix-mode').addEventListener('change',renderMatrix);
renderThreshold(true);
const figures={association:['健康行为调整后优势比及95%置信区间','无休闲运动的调整后 OR 为 1.427（95% CI：1.358–1.500）。','横断面关联，需要时间视角','吸烟和饮酒的部分关联方向，可能受到确诊后的戒烟、饮酒减少及未测量因素影响。调查记录的是近期行为与既往确诊状态，不能据此推断行为改变的干预效果。'],missingness:['结局明确样本的变量缺失比例','收入缺失 17.96%，蔬菜频次缺失 11.60%，水果频次缺失 9.94%。','缺失，改变了分析人群','完整案例保留 71.66% 的结局明确记录。纳入与排除样本的加权阳性比例分别为10.89%和10.51%；比例接近不能排除行为分布及关联结构的选择差异。'],age:['不同年龄组自报糖尿病加权比例','完整案例中，年龄组之间的加权自报糖尿病比例有明显差异。','年龄提供了基础区分信息','年龄在所有模型中按13个类别进入，未把类别编号视为等距连续变量。最高年龄组的回落还可能涉及出生队列、诊断机会及存活选择。']};
document.querySelectorAll('[data-figure]').forEach(button=>button.addEventListener('click',()=>{
 const name=button.dataset.figure;const v=figures[name];
 document.querySelectorAll('[data-figure]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
 $('stat-figure').src=`assets/${name}.png`;$('stat-figure').alt=v[0];$('stat-caption').textContent=v[1];$('stat-title').textContent=v[2];$('stat-text').textContent=v[3];
}));
function bars(values,container,signed){
 const max=Math.max(...values.map(Math.abs));
 const order=values.map((value,i)=>({value,label:D.explanation.labels[i]})).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
 $(container).innerHTML=order.map(({value,label})=>`<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar ${value<0?'negative':''}" style="width:${Math.abs(value)/max*100}%"></div></div><span>${signed&&value>0?'+':''}${value.toFixed(3)}</span></div>`).join('');
}
bars(D.explanation.global,'importance-bars',false);
function renderCase(){const c=D.explanation.cases[Number($('case-select').value)];$('case-prob').textContent=`模型概率 ${pct(c.probability)} · 基准 log-odds ${c.base.toFixed(3)} + 特征贡献 ${c.contributions.reduce((a,b)=>a+b,0).toFixed(3)}`;bars(c.contributions,'case-bars',true);}
$('case-select').addEventListener('change',renderCase);renderCase();
