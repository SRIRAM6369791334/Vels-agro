// Vels Agro Enterprise — Professional GST Tax Invoice, Payment Receipt & Gate Pass Generator
// Section 21: Invoice & Documentation (GST Compliant, Print & Download ready)

import { escapeHtml, formatMoney, formatDate, formatTime } from '../../main';
import { gsap } from 'gsap';
import { INITIAL_DEALERS as DEALERS } from '../dealers/dealer-data';
import { AGRO_FARMER_CUSTOMERS, type AgroSalesOrder } from './agro-orders-data';
import { INITIAL_AGRO_PRODUCTS } from '../products/agro-products-data';

// Helper to convert Indian number to words
function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const roundNum = Math.round(num);

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += (str ? 'and ' : '') + convertTwoDigits(n);
    }
    return str.trim();
  }

  let crore = Math.floor(roundNum / 10000000);
  let remainder = roundNum % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  let hundreds = remainder % 1000;

  let res = '';
  if (crore > 0) res += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) res += convertThreeDigits(lakh) + ' Lakh ';
  if (thousand > 0) res += convertThreeDigits(thousand) + ' Thousand ';
  if (hundreds > 0) res += convertThreeDigits(hundreds);

  return 'Rupees ' + res.trim() + ' Only';
}

export function openGstInvoiceModal(order: AgroSalesOrder | any) {
  let existingModal = document.getElementById('gst-invoice-modal-overlay');
  if (existingModal) existingModal.remove();

  // Find customer/dealer info
  let dealer = DEALERS.find(d => d.id === order.customerId);
  let farmer = AGRO_FARMER_CUSTOMERS.find(f => f.id === order.customerId);

  let buyerName = dealer?.name || farmer?.name || order.customerName || 'Customer';
  let buyerContact = dealer?.contactPerson || farmer?.contact || buyerName;
  let buyerPhone = dealer?.phone || farmer?.phone || '+91 98422 00000';
  let buyerAddress = dealer?.address || `${farmer?.city || 'Pollachi'}, ${farmer?.region || 'Tamil Nadu'}`;
  let buyerGstin = dealer?.gstin || order.gstin || 'URP (Unregistered / Farmer)';
  let buyerState = dealer?.state || 'Tamil Nadu';
  let isDealer = !!dealer || order.channel === 'wholesale' || order.orderType === 'dealer_wholesale';

  let invoiceNo = order.invoiceNumber || `VELS-INV-2026-${order.number.replace('#', '').replace('AG-', '')}`;
  let invoiceDate = order.invoiceDate ? formatDate(order.invoiceDate) : formatDate(order.createdAt || Date.now());

  // Compute line items with HSN and GST
  let lineDetails = (order.lines || []).map((line: any, idx: number) => {
    let p = INITIAL_AGRO_PRODUCTS.find(item => item.id === line.productId);
    let name = p?.name || line.name || `Agricultural Machinery Item #${idx + 1}`;
    let sku = p?.sku || line.sku || 'VELS-PART';
    let hsn = (p as any)?.hsn || (name.toLowerCase().includes('tractor') ? '8701' : name.toLowerCase().includes('blade') || name.toLowerCase().includes('pump') || name.toLowerCase().includes('pto') ? '8433' : '8432');
    let gstRate = (p as any)?.gstRate || (hsn === '8433' ? 18 : 12);
    let qty = line.qty || 1;
    let rate = line.price || (p ? p.price.inr : 10000);
    let gross = qty * rate;

    // For GST invoices, gross is inclusive of tax, so calculate base taxable amount
    let taxable = Math.round(gross / (1 + gstRate / 100));
    let taxAmt = gross - taxable;
    let cgstRate = gstRate / 2;
    let sgstRate = gstRate / 2;
    let cgstAmt = Math.round(taxAmt / 2);
    let sgstAmt = taxAmt - cgstAmt;

    let chassis = order.chassisNumbers?.[line.productId] || '';
    let engine = order.engineNumbers?.[line.productId] || '';

    return {
      sno: idx + 1,
      name,
      sku,
      hsn,
      qty,
      rate,
      gross,
      taxable,
      gstRate,
      cgstRate,
      cgstAmt,
      sgstRate,
      sgstAmt,
      total: gross,
      chassis,
      engine
    };
  });

  let grandTotal = lineDetails.reduce((sum: number, l: any) => sum + l.total, 0);
  let totalTaxable = lineDetails.reduce((sum: number, l: any) => sum + l.taxable, 0);
  let totalCgst = lineDetails.reduce((sum: number, l: any) => sum + l.cgstAmt, 0);
  let totalSgst = lineDetails.reduce((sum: number, l: any) => sum + l.sgstAmt, 0);
  let totalTax = totalCgst + totalSgst;
  let totalWords = numberToIndianWords(grandTotal);

  let lrNo = order.lrNumber || `LR-VRL-${order.number.replace(/[^0-9]/g, '') || '91204'}`;
  let ewayBill = order.ewayBillNumber || `2418 9032 ${order.number.replace(/[^0-9]/g, '') || '8841'}`;
  let vehicleNo = order.vehicleNumber || 'TN-38-BZ-4921 (Flatbed Truck)';
  let transporter = order.transporterName || order.carrier || 'VRL Logistics (Flatbed Fleet)';

  // Build overlay container as HTML Dialog for proper top layer stacking
  let overlay = document.createElement('dialog');
  overlay.id = 'gst-invoice-modal-overlay';
  overlay.className = 'gst-inv-overlay';

  overlay.innerHTML = `
    <div class="gst-inv-wrap">
      <!-- Modal Top Toolbar (Screen Only) -->
      <header class="gst-inv-toolbar no-print">
        <div class="gst-inv-toolbar__left">
          <div class="gst-inv-tabs" role="tablist">
            <button type="button" class="gst-inv-tab is-active" data-tab="tax-inv">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Tax Invoice (GST INV-1)
            </button>
            <button type="button" class="gst-inv-tab" data-tab="receipt">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Advance Payment Receipt
            </button>
            <button type="button" class="gst-inv-tab" data-tab="gatepass">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Delivery Challan & Gate Pass
            </button>
          </div>
        </div>
        <div class="gst-inv-toolbar__actions">
          <button type="button" class="btn btn--secondary btn-inv-print">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Document
          </button>
          <button type="button" class="btn btn--primary btn-inv-download">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download HTML / PDF
          </button>
          <button type="button" class="btn btn--icon btn-inv-close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </header>

      <!-- Printable Document Canvas -->
      <div class="gst-inv-sheet-wrapper">
        <article class="gst-inv-sheet" id="gst-inv-printable">
          
          <!-- Document Header -->
          <header class="sheet-head">
            <div class="sheet-brand">
              <div class="sheet-logo-badge">
                <span class="sheet-logo-text">VELS</span>
                <span class="sheet-logo-sub">AGRO</span>
              </div>
              <div class="sheet-company-meta">
                <h1 class="sheet-company-name">VELS AGRO ENTERPRISE PRIVATE LIMITED</h1>
                <p class="sheet-company-addr">SF No. 42/1, Avinashi Road, Civil Aerodrome Post, Coimbatore - 641014, Tamil Nadu, India</p>
                <p class="sheet-company-tax">
                  <span><strong>GSTIN:</strong> 33AAACV9842K1Z5</span> &bull; 
                  <span><strong>PAN:</strong> AAACV9842K</span> &bull; 
                  <span><strong>CIN:</strong> U29211TZ2018PTC030912</span> &bull; 
                  <span><strong>State Code:</strong> 33 (Tamil Nadu)</span>
                </p>
                <p class="sheet-company-contact">Phone: +91 422 2984100 &bull; Email: billing@velsagro.com &bull; Web: www.velsagro.com</p>
              </div>
            </div>
            <div class="sheet-badge-wrap">
              <div class="sheet-doc-type" id="sheet-doc-title">TAX INVOICE</div>
              <div class="sheet-doc-sub">(Under Section 31 of CGST Act, 2017)</div>
              <div class="sheet-doc-copy">ORIGINAL FOR RECIPIENT</div>
            </div>
          </header>

          <hr class="sheet-divider" />

          <!-- Meta Grid: Invoice Info & Dispatch Details -->
          <div class="sheet-meta-grid">
            <div class="sheet-meta-col">
              <table class="sheet-meta-table">
                <tr>
                  <td>Invoice Number:</td>
                  <td><strong>${escapeHtml(invoiceNo)}</strong></td>
                </tr>
                <tr>
                  <td>Invoice Date:</td>
                  <td><strong>${escapeHtml(invoiceDate)}</strong></td>
                </tr>
                <tr>
                  <td>Order Reference:</td>
                  <td>${escapeHtml(order.number)} (${escapeHtml(order.channel === 'wholesale' ? 'Dealer Bulk B2B' : 'Farmer Retail')})</td>
                </tr>
                <tr>
                  <td>Place of Supply:</td>
                  <td>${escapeHtml(buyerState)} (State Code: ${buyerState === 'Tamil Nadu' ? '33' : buyerState === 'Punjab' ? '03' : buyerState === 'Karnataka' ? '29' : '27'})</td>
                </tr>
                <tr>
                  <td>Reverse Charge:</td>
                  <td>No</td>
                </tr>
              </table>
            </div>

            <div class="sheet-meta-col">
              <table class="sheet-meta-table">
                <tr>
                  <td>Transporter:</td>
                  <td><strong>${escapeHtml(transporter)}</strong></td>
                </tr>
                <tr>
                  <td>Lorry Bilty / LR No:</td>
                  <td><strong>${escapeHtml(lrNo)}</strong></td>
                </tr>
                <tr>
                  <td>Vehicle Number:</td>
                  <td>${escapeHtml(vehicleNo)}</td>
                </tr>
                <tr>
                  <td>E-Way Bill Number:</td>
                  <td><strong>${escapeHtml(ewayBill)}</strong></td>
                </tr>
                <tr>
                  <td>Payment Terms:</td>
                  <td>${escapeHtml(order.paymentMode || (isDealer ? 'Dealer 30-Day Credit' : 'NEFT / RTGS'))}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Parties Grid: Billed To & Shipped To -->
          <div class="sheet-parties-grid">
            <div class="sheet-party-box">
              <div class="sheet-party-title">DETAILS OF RECEIVER | BILLED TO:</div>
              <div class="sheet-party-name">${escapeHtml(buyerName)}</div>
              <div class="sheet-party-meta">
                <p><strong>Contact Person:</strong> ${escapeHtml(buyerContact)} (Ph: ${escapeHtml(buyerPhone)})</p>
                <p><strong>Address:</strong> ${escapeHtml(buyerAddress)}</p>
                <p><strong>State / Country:</strong> ${escapeHtml(buyerState)}, India</p>
                <p class="sheet-party-gst"><strong>GSTIN / UIN:</strong> <span class="mono-bold">${escapeHtml(buyerGstin)}</span></p>
                ${farmer?.tags ? `<p><strong>Land & Crop Profile:</strong> ${escapeHtml(farmer.tags.join(' • '))}</p>` : ''}
              </div>
            </div>

            <div class="sheet-party-box">
              <div class="sheet-party-title">DISPATCH & DELIVERY DETAILS | SHIPPED TO:</div>
              <div class="sheet-party-name">${escapeHtml(buyerName)}</div>
              <div class="sheet-party-meta">
                <p><strong>Destination:</strong> ${escapeHtml(buyerAddress)}</p>
                <p><strong>Delivery Driver Ph:</strong> ${escapeHtml(order.driverPhone || buyerPhone)}</p>
                <p><strong>PDI Status:</strong> <span class="tag-pdi">Pre-Delivery Quality Inspection Cleared</span></p>
                <p><strong>Transit Mode:</strong> Low-Bed Hydraulic Flatbed Carrier</p>
              </div>
            </div>
          </div>

          <!-- Line Items Table -->
          <div class="sheet-table-wrap">
            <table class="sheet-items-table">
              <thead>
                <tr>
                  <th style="width: 38px;">S.No</th>
                  <th>Description of Agricultural Machinery & Equipment</th>
                  <th style="width: 70px;">HSN/SAC</th>
                  <th style="width: 50px;">Qty</th>
                  <th style="width: 90px;">Unit Rate (₹)</th>
                  <th style="width: 90px;">Taxable Value (₹)</th>
                  <th style="width: 75px;">CGST</th>
                  <th style="width: 75px;">SGST</th>
                  <th style="width: 100px;">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${lineDetails.map((item: any) => `
                  <tr>
                    <td class="text-center">${item.sno}</td>
                    <td>
                      <div class="sheet-item-name"><strong>${escapeHtml(item.name)}</strong></div>
                      <div class="sheet-item-sku mono">SKU: ${escapeHtml(item.sku)}</div>
                      ${item.chassis ? `<div class="sheet-item-serial"><strong>VIN / Chassis:</strong> ${escapeHtml(item.chassis)}</div>` : ''}
                      ${item.engine ? `<div class="sheet-item-serial"><strong>Engine No:</strong> ${escapeHtml(item.engine)}</div>` : ''}
                    </td>
                    <td class="text-center mono">${item.hsn}</td>
                    <td class="text-center"><strong>${item.qty}</strong></td>
                    <td class="text-right">${formatMoney(item.rate)}</td>
                    <td class="text-right"><strong>${formatMoney(item.taxable)}</strong></td>
                    <td class="text-right"><small>${item.cgstRate}%</small><br />${formatMoney(item.cgstAmt)}</td>
                    <td class="text-right"><small>${item.sgstRate}%</small><br />${formatMoney(item.sgstAmt)}</td>
                    <td class="text-right"><strong>${formatMoney(item.total)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="sheet-tfoot-sub">
                  <td colspan="5" class="text-right"><strong>Sub-Totals:</strong></td>
                  <td class="text-right"><strong>${formatMoney(totalTaxable)}</strong></td>
                  <td class="text-right"><strong>${formatMoney(totalCgst)}</strong></td>
                  <td class="text-right"><strong>${formatMoney(totalSgst)}</strong></td>
                  <td class="text-right"><strong>${formatMoney(grandTotal)}</strong></td>
                </tr>
                <tr class="sheet-tfoot-tax">
                  <td colspan="6" class="text-right">Total Goods & Service Tax (CGST + SGST):</td>
                  <td colspan="3" class="text-right"><strong>${formatMoney(totalTax)}</strong></td>
                </tr>
                <tr class="sheet-tfoot-grand">
                  <td colspan="6" class="text-right"><strong>TOTAL INVOICE VALUE (ROUNDED):</strong></td>
                  <td colspan="3" class="text-right"><strong>${formatMoney(grandTotal)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Amount in Words -->
          <div class="sheet-words-box">
            <span>Amount Chargeable (in words):</span>
            <strong>${escapeHtml(totalWords)}</strong>
          </div>

          <!-- Tax Summary Breakdown -->
          <div class="sheet-tax-summary">
            <table class="sheet-tax-table">
              <thead>
                <tr>
                  <th>HSN/SAC</th>
                  <th>Taxable Value (₹)</th>
                  <th>Central Tax (CGST) Rate</th>
                  <th>Central Tax Amount (₹)</th>
                  <th>State Tax (SGST) Rate</th>
                  <th>State Tax Amount (₹)</th>
                  <th>Total Tax Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="mono">8701 (Tractors)</td>
                  <td class="text-right">${formatMoney(Math.round(totalTaxable * 0.75))}</td>
                  <td class="text-center">6%</td>
                  <td class="text-right">${formatMoney(Math.round(totalCgst * 0.75))}</td>
                  <td class="text-center">6%</td>
                  <td class="text-right">${formatMoney(Math.round(totalSgst * 0.75))}</td>
                  <td class="text-right"><strong>${formatMoney(Math.round(totalTax * 0.75))}</strong></td>
                </tr>
                <tr>
                  <td class="mono">8432 / 8433 (Implements & Spares)</td>
                  <td class="text-right">${formatMoney(totalTaxable - Math.round(totalTaxable * 0.75))}</td>
                  <td class="text-center">6% / 9%</td>
                  <td class="text-right">${formatMoney(totalCgst - Math.round(totalCgst * 0.75))}</td>
                  <td class="text-center">6% / 9%</td>
                  <td class="text-right">${formatMoney(totalSgst - Math.round(totalSgst * 0.75))}</td>
                  <td class="text-right"><strong>${formatMoney(totalTax - Math.round(totalTax * 0.75))}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Banking & Remittance Details + Declaration -->
          <div class="sheet-bottom-grid">
            <div class="sheet-bank-box">
              <div class="sheet-subhead">COMPANY BANK DETAILS FOR RTGS / NEFT:</div>
              <p><strong>Account Name:</strong> Vels Agro Enterprise Private Limited</p>
              <p><strong>Bank:</strong> State Bank of India (SBI)</p>
              <p><strong>Branch:</strong> SME City Branch, Trichy Road, Coimbatore</p>
              <p><strong>Account No:</strong> <span class="mono-bold">40982348912</span> (Current Account)</p>
              <p><strong>IFSC Code:</strong> <span class="mono-bold">SBIN0001234</span></p>
              <p><strong>UPI ID:</strong> <span class="mono">velsagro@sbi</span></p>
            </div>

            <div class="sheet-terms-box">
              <div class="sheet-subhead">TERMS & CONDITIONS OF SALE:</div>
              <ol>
                <li>Goods once delivered are covered under 12-month manufacturer comprehensive warranty against metallurgical defects.</li>
                <li>Free 3 mandatory on-field service inspections included (50 hrs, 250 hrs, 500 hrs).</li>
                <li>RTO registration, road tax, and tractor insurance are buyer responsibilities unless packaged in lease agreement.</li>
                <li>Subject to Coimbatore Jurisdiction only.</li>
              </ol>
            </div>
          </div>

          <!-- Signatory Footer -->
          <footer class="sheet-foot">
            <div class="sheet-sign-box">
              <div class="sheet-sign-line"></div>
              <p>Customer / Dealer Signature</p>
              <small>(Accepted in good order & field demo done)</small>
            </div>

            <div class="sheet-sign-box text-right">
              <div class="sheet-seal-badge">
                <span>VELS AGRO ENTERPRISE PVT LTD</span>
                <small>AUTHORIZED SIGNATORY</small>
              </div>
              <div class="sheet-sign-line"></div>
              <p><strong>For VELS AGRO ENTERPRISE PVT LTD</strong></p>
              <small>Authorized Signatory & Chief Accounts Officer</small>
            </div>
          </footer>

        </article>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.showModal();

  // GSAP Entry Animation
  gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
  gsap.fromTo(
    overlay.querySelector('.gst-inv-wrap'),
    { scale: 0.94, opacity: 0, y: 16 },
    { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
  );

  // Close helper
  function closeModal() {
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        try { overlay.close(); } catch {}
        overlay.remove();
      }
    });
  }

  overlay.querySelector('.btn-inv-close')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Tab switching
  let tabs = overlay.querySelectorAll('.gst-inv-tab');
  let titleEl = overlay.querySelector('#sheet-doc-title') as HTMLElement;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      let tabKey = (tab as HTMLElement).dataset.tab;
      if (tabKey === 'receipt') {
        if (titleEl) titleEl.textContent = 'ADVANCE PAYMENT & TOKEN RECEIPT';
      } else if (tabKey === 'gatepass') {
        if (titleEl) titleEl.textContent = 'DELIVERY CHALLAN & GATE PASS';
      } else {
        if (titleEl) titleEl.textContent = 'TAX INVOICE';
      }
    });
  });

  // Print Action
  overlay.querySelector('.btn-inv-print')?.addEventListener('click', () => {
    window.print();
  });

  // Download Action
  overlay.querySelector('.btn-inv-download')?.addEventListener('click', () => {
    let sheet = overlay.querySelector('#gst-inv-printable');
    if (!sheet) return;
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${invoiceNo} - Vels Agro Enterprise GST Invoice</title>
        <style>
          ${document.querySelector('style#invoice-css')?.textContent || ''}
          body { font-family: system-ui, -apple-system, sans-serif; background: #fff; margin: 20px; }
          .sheet-head { display: flex; justify-content: space-between; border-bottom: 2px solid #2e7d32; padding-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f0f7f0; color: #1e3a1e; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        ${sheet.innerHTML}
      </body>
      </html>
    `;
    let blob = new Blob([htmlContent], { type: 'text/html' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
