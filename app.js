'use strict';
(() => {
 const config = window.ASAYEL_CONFIG;
 const products = config.products;
 const $ = id => document.getElementById(id);
 const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const money = amount => new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(amount);
 const price = amount => `${money(amount)} <span class="currency">ر.س</span>`;
 const normalize = value => value.normalize('NFKD').replace(/[\u064B-\u065F]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').trim().toLowerCase();
 function read(key,fallback) {try {return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch {return fallback;}}
 let cart = read('asayel.cart.v1',[]);
 cart = Array.isArray(cart) ? cart.filter(x => products.some(p=>p.id===x.id && p.sizes.includes(x.size)) && Number.isInteger(x.qty) && x.qty>0 && x.qty<=20) : [];
 let favorites = read('asayel.favorites.v1',[]);
 favorites = Array.isArray(favorites) ? favorites.filter(id=>products.some(p=>p.id===id)) : [];
 let filter='all',query='',sort='featured',activeProduct=null,selectedSize=null,toastTimer;
 function persist(){try {localStorage.setItem('asayel.cart.v1',JSON.stringify(cart));localStorage.setItem('asayel.favorites.v1',JSON.stringify(favorites));}catch {} updateCount();}
 function updateCount(){const count=cart.reduce((n,p)=>n+p.qty,0);$('cart-count').textContent=count;$('mobile-count').textContent=count;}
 function notify(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3000);}
 function open(id){const dialog=$(id);if(!dialog.open)dialog.showModal();}
 function visibleProducts(){let result=products.filter(p=>filter==='all'||filter==='new'&&p.isNew||filter==='favorites'&&favorites.includes(p.id)||p.category===filter);if(query){const needle=normalize(query);result=result.filter(p=>normalize(`${p.name} ${p.subtitle} ${p.color} ${p.category==='everyday'?'يومية':'مناسبات'}`).includes(needle));}return [...result].sort((a,b)=>sort==='price-low'?a.price-b.price:sort==='price-high'?b.price-a.price:0);}
 function renderProducts(){const list=visibleProducts();$('product-grid').innerHTML=list.map(p=>`<article class="product-card"><div class="product-media"><div class="product-image panel-${p.panel}" role="img" aria-label="${escape(p.name)}، صورة تصورية"></div><button class="product-open" data-product="${p.id}" aria-label="عرض ${escape(p.name)}"></button>${p.isNew?'<span class="product-badge">وصل حديثًا</span>':''}<button class="icon-button wish-button ${favorites.includes(p.id)?'saved':''}" data-favorite="${p.id}" aria-pressed="${favorites.includes(p.id)}" aria-label="${favorites.includes(p.id)?'إزالة من':'إضافة إلى'} المفضلة: ${escape(p.name)}"><svg><use href="#i-heart"/></svg></button><button class="quick-view" data-product="${p.id}">اكتشفي التفاصيل</button></div><div class="product-meta"><div class="product-meta-top"><button class="product-title" data-product="${p.id}">${escape(p.name)}</button><span class="price">${price(p.price)}</span></div><p class="product-subtitle">${escape(p.subtitle)}</p><div class="product-bottom"><span class="color-dot ${p.panel===1?'taupe':''}" title="${escape(p.color)}"></span><span class="mini-text">${p.category==='everyday'?'إطلالتكِ اليومية':'لمناسباتكِ'}</span></div></div></article>`).join('');$('no-results').hidden=list.length!==0;$('result-count').textContent=`${list.length} عبايات في التشكيلة`;
 document.querySelectorAll('.filter').forEach(b=>{const selected=b.dataset.filter===filter;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected);});
 $('collection-title').textContent=filter==='favorites'?'اختياراتكِ المفضلة':query?`نتائج البحث عن «${query}»`:'تفاصيل تختارينها. أناقة تعيشينها.';}
 function applyFilter(value){filter=value;query='';$('search-input').value='';renderProducts();$('main-nav').classList.remove('open');document.querySelector('.mobile-menu').setAttribute('aria-expanded','false');}
 function productDetails(id){const p=products.find(x=>x.id===id);if(!p)return;activeProduct=p;selectedSize=null;
 $('product-content').innerHTML=`<div class="product-layout"><div class="product-large-photo panel-${p.panel}" role="img" aria-label="${escape(p.name)}، صورة تصورية"></div><div class="product-info"><span class="eyebrow">ASAYEL LINE · ${p.category==='everyday'?'EVERYDAY EDIT':'OCCASION EDIT'}</span><h2 id="product-title">${escape(p.name)}</h2><p>${escape(p.subtitle)}</p><span class="price">${price(p.price)}</span><p class="desc">تصوّر لإطلالة ${p.category==='everyday'?'يومية بخطوط بسيطة':'مناسبة بتفاصيل ناعمة'}، بلون ${escape(p.color)}. تُضاف تفاصيل الخامة والقصّة وصور المنتج الفعلية قبل إتاحة الطلب.</p><span class="field-label">اختاري طول العباية</span><div class="sizes" role="group" aria-label="اختيار المقاس">${p.sizes.map(s=>`<button class="size-option" data-size="${s}" aria-pressed="false">${s}</button>`).join('')}</div><button class="size-link" data-action="sizes">كيف أختار المقاس المناسب؟</button><button class="button button-dark add-button" data-action="add"><svg><use href="#i-bag"/></svg>أضيفي إلى حقيبتكِ</button><p class="muted">منتج وسعر توضيحيان. لا يتم إنشاء طلب أو تحصيل مبلغ.</p></div></div>`;open('product-dialog');}
 function addToCart(){if(!activeProduct)return;if(!selectedSize){notify('اختاري المقاس أولًا');$('product-content').querySelector('.size-option')?.focus();return;}const current=cart.find(x=>x.id===activeProduct.id&&x.size===selectedSize);if(current?.qty>=20){notify('وصلتِ إلى الحد الأقصى للكمية');return;}if(current)current.qty++;else cart.push({id:activeProduct.id,size:selectedSize,qty:1});persist();$('product-dialog').close();notify('أضيفت العباية إلى حقيبتكِ');renderCart();open('cart-dialog');}
 function renderCart(){if(!cart.length){$('cart-content').innerHTML='<div class="cart-empty"><svg><use href="#i-bag"/></svg><h3>حقيبتكِ تنتظر اختياراتكِ</h3><p>ابدئي بتفاصيل قريبة من ذوقكِ.</p><button class="button button-dark" data-action="continue">اكتشفي التشكيلة</button></div>';$('cart-summary').innerHTML='';return;}
 $('cart-content').innerHTML=cart.map((item,i)=>{const p=products.find(x=>x.id===item.id);return `<article class="cart-item"><div class="cart-thumb panel-${p.panel}" role="img" aria-label="${escape(p.name)}"></div><div><h3>${escape(p.name)}</h3><small>المقاس ${item.size} · ${escape(p.color)}</small><span class="price">${price(p.price)}</span><div class="cart-item-controls"><div class="quantity-control"><button data-quantity="${i}" data-delta="-1" aria-label="تقليل كمية ${escape(p.name)}">−</button><span aria-label="الكمية">${item.qty}</span><button data-quantity="${i}" data-delta="1" aria-label="زيادة كمية ${escape(p.name)}">+</button></div><button class="remove-item" data-remove="${i}">إزالة</button></div></div></article>`;}).join('');
 const total=cart.reduce((sum,x)=>sum+products.find(p=>p.id===x.id).price*x.qty,0);
 $('cart-summary').innerHTML=`<div class="cart-summary"><div class="cart-total"><span>الإجمالي التوضيحي</span><span>${price(total)}</span></div><button class="button button-dark" data-action="checkout">${config.preview?'معلومات الطلب':'متابعة الطلب'}</button><p class="cart-note">${config.preview?'هذه حقيبة تجريبية. الدفع وإرسال الطلبات غير مفعّلين، والأسعار لا تمثل عرض بيع.':'تُعرض تفاصيل الشحن والسعر النهائي في صفحة إتمام الطلب.'}</p><button class="text-link" data-action="continue">تابعي التسوّق</button></div>`;}
 const information={
 sizes:{title:'دليل المقاسات',body:'<p>اختاري طول العباية المناسب بمقارنته بعباية لديكِ ومريحة لكِ، من أعلى الكتف إلى الحافة السفلية.</p><table><thead><tr><th>المقاس</th><th>الطول بالبوصة</th><th>الطول التقريبي بالسنتيمتر</th></tr></thead><tbody><tr><td>52</td><td>52</td><td>132</td></tr><tr><td>54</td><td>54</td><td>137</td></tr><tr><td>56</td><td>56</td><td>142</td></tr><tr><td>58</td><td>58</td><td>147</td></tr><tr><td>60</td><td>60</td><td>152</td></tr></tbody></table><p class="muted">الجدول تحويل تقريبي لطول البوصة، وليس جدول قياسات معتمدًا للمنتجات. تختلف قياسات الصدر والكتف والأكمام حسب القصّة، وتُضاف القياسات الفعلية لكل منتج قبل البيع.</p>'},
 care:{title:'العناية بعبايتكِ',body:'<p>اتبعي أولًا تعليمات العناية الموجودة على ملصق المنتج، فهي المرجع المناسب لخامة عبايتكِ.</p><ul><li>افصلي الألوان الداكنة عن الفاتحة.</li><li>تجنّبي المبيّضات والحرارة العالية ما لم يسمح ملصق العناية بذلك.</li><li>احفظي العباية على علاقة مناسبة بعيدًا عن الرطوبة وأشعة الشمس المباشرة.</li><li>استشيري مغسلة متخصصة عند وجود تطريز أو تفاصيل حساسة.</li></ul>'},
 faq:{title:'الأسئلة الشائعة',body:'<details open><summary>هل يمكنني الطلب الآن؟</summary><p>المتجر حاليًا نسخة للمعاينة. يمكنكِ تجربة البحث والمفضلة والحقيبة، دون إنشاء طلب أو دفع.</p></details><details><summary>كيف أختار مقاس العباية؟</summary><p>راجعي دليل المقاسات وقارني الطول بعباية مناسبة لكِ. ستُضاف قياسات المنتجات الفعلية قبل البيع.</p></details><details><summary>ما مدة الشحن ومناطق التوصيل؟</summary><p>ستُعلن مناطق التوصيل والمدة والرسوم عند إطلاق المتجر.</p></details><details><summary>ما سياسة الاستبدال والاسترجاع؟</summary><p>ستُضاف السياسة المعتمدة وشروطها قبل استقبال أي طلب.</p></details>'},
 policy:{title:'الشحن والاستبدال',body:'<p>سيتم نشر تفاصيل الشحن والاستبدال والاسترجاع المعتمدة قبل بدء البيع، وتشمل مناطق التوصيل ورسومه والمدة المتوقعة وإجراءات الاستبدال والاسترجاع.</p><p>لا تُستقبل طلبات ولا تُحصّل مبالغ في نسخة المعاينة الحالية.</p>'},
 privacy:{title:'الخصوصية في نسخة المعاينة',body:'<p>تُحفظ المفضلة ومحتويات الحقيبة في متصفحكِ على هذا الجهاز. لا تطلب هذه النسخة بيانات شخصية أو معلومات دفع، ولا تحتوي على أدوات تحليل زوار مضافة من المتجر.</p><p>قد يسجّل مزوّد الاستضافة معلومات تقنية عن الوصول إلى الموقع. ستُحدّث سياسة الخصوصية عند تفعيل الطلبات أو إضافة خدمات خارجية.</p><button class="button button-outline" data-action="clear">مسح المفضلة والحقيبة من هذا الجهاز</button>'},
 contact:{title:'تواصلي مع أصايل',body:'<p>ستُضاف قنوات التواصل الرسمية عند إطلاق المتجر. لا توجد أرقام هاتف أو حسابات تجريبية قابلة للتواصل.</p>'},
 checkout:{title:'قريبًا، إطلالتكِ من أصايل',body:'<p>هذه نسخة معاينة، ولم تُفعّل الطلبات أو بوابة الدفع بعد. اختيارات الحقيبة محفوظة في متصفحكِ فقط.</p><p>شكرًا لاختياركِ أصايل لاين. نتمنى أن ترافقكِ عبايتكِ الجديدة في أيامكِ الجميلة ومناسباتكِ المميزة.</p>'}
 };
 function showInfo(key){const info=information[key];if(!info)return;$('info-title').textContent=info.title;$('info-content').innerHTML=info.body;open('info-dialog');}
 function checkout(){if(config.preview||!config.checkoutUrl){showInfo('checkout');return;}try {const target=new URL(config.checkoutUrl);if(target.protocol!=='https:')throw new Error();window.location.assign(target.href);}catch{notify('الطلب غير متاح حاليًا');}}
 document.addEventListener('click',event=>{
 const b=event.target.closest('button,a');if(!b)return;
 if(b.hasAttribute('data-close')){b.closest('dialog')?.close();return;}
 if(b.dataset.filter){event.preventDefault();applyFilter(b.dataset.filter);$('collection').scrollIntoView({behavior:'smooth'});return;}
 if(b.dataset.product){productDetails(b.dataset.product);return;}
 if(b.dataset.favorite){const id=b.dataset.favorite;const was=favorites.includes(id);favorites=was?favorites.filter(x=>x!==id):[...favorites,id];persist();renderProducts();notify(was?'أزيلت من المفضلة':'أضيفت إلى المفضلة');return;}
 if(b.dataset.size){selectedSize=b.dataset.size;document.querySelectorAll('.size-option').forEach(el=>{const active=el.dataset.size===selectedSize;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',active);});return;}
 if(b.dataset.quantity!==undefined){const i=Number(b.dataset.quantity);if(!cart[i])return;cart[i].qty=Math.min(20,cart[i].qty+Number(b.dataset.delta));if(cart[i].qty<=0)cart.splice(i,1);persist();renderCart();return;}
 if(b.dataset.remove!==undefined){cart.splice(Number(b.dataset.remove),1);persist();renderCart();return;}
 const action=b.dataset.action;
 if(action==='menu'){const expanded=$('main-nav').classList.toggle('open');b.setAttribute('aria-expanded',expanded);}
 else if(action==='cart'){renderCart();open('cart-dialog');}
 else if(action==='search'){open('search-dialog');$('search-input').focus();}
 else if(action==='favorites'){applyFilter('favorites');$('collection').scrollIntoView({behavior:'smooth'});}
 else if(action==='add')addToCart();
 else if(action==='continue'){document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('collection').scrollIntoView({behavior:'smooth'});}
 else if(action==='checkout')checkout();
 else if(action==='top')window.scrollTo({top:0,behavior:'smooth'});
 else if(action==='clear'){cart=[];favorites=[];persist();renderProducts();renderCart();notify('تم مسح الحقيبة والمفضلة');$('info-dialog').close();}
 else if(information[action])showInfo(action);
 });
 $('search-form').addEventListener('submit',event=>{event.preventDefault();query=$('search-input').value.trim().slice(0,100);filter='all';renderProducts();$('search-dialog').close();$('collection').scrollIntoView({behavior:'smooth'});});
 $('sort').addEventListener('change',event=>{sort=event.target.value;renderProducts();});
 document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
 $('year').textContent=new Date().getFullYear();updateCount();renderProducts();
})();
