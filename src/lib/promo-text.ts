"use client";

import { useSyncExternalStore } from "react";

/**
 * Texts for the promo / referral code box and the calculator's promo lines.
 * Chosen from the page language (<html lang>), the same signal the affiliate
 * form uses. Chinese is Simplified (zh-Hans). Code labels such as
 * "10% off storage, first month" come from the affiliate system itself.
 */
const EN = {
  boxLabel: "Promo / referral code (optional)",
  placeholder: "ENTER CODE",
  inputAria: "Promo or referral code",
  apply: "Apply",
  checking: "Checking…",
  remove: "Remove code",
  replaceLabel: "Have a different code? Entering it replaces this one.",
  onePerOrder: "One offer per order; offers can't be combined.",
  invalid: "That code isn't valid. Check it and try again.",
  checkFailed: "Couldn't check the code. Try again.",
  referralActive: "You're already getting our referral offer from your link; offers can't be combined.",
  applied: "applied",
  monthsFree: (free: number, commitment: number) =>
    `${free} month${free > 1 ? "s" : ""} free on a ${commitment}-month plan.`,
  monthlyOnly: "Applies to Month-to-Month plans only.",
  newCustomersOnly: "New customers only; confirmed by our team.",
  subjectToConfirmation: "Prices with a promo are subject to confirmation.",
  notOnThisPlan: "This code applies to Month-to-Month only, so it isn't included on the plan you've chosen.",
  promoLine: (code: string) => `Promo ${code}`,
  promoSaving: (amount: string, months: number) => `Promo saving: −$${amount} over ${months} month${months > 1 ? "s" : ""}`,
  totalWithPromo: "Estimated total with promo",
  subjectTo: "(subject to confirmation)",
  floorLimited: "The saving is limited so storage never drops below S$55 per module a month.",
};

const ZH: typeof EN = {
  boxLabel: "优惠码 / 推荐码（选填）",
  placeholder: "输入优惠码",
  inputAria: "优惠码或推荐码",
  apply: "使用",
  checking: "检查中…",
  remove: "移除优惠码",
  replaceLabel: "要使用其他优惠码？输入新的优惠码即可替换当前这个。",
  onePerOrder: "每张订单只能使用一个优惠，优惠不可叠加。",
  invalid: "此优惠码无效，请检查后重试。",
  checkFailed: "无法检查优惠码，请重试。",
  referralActive: "您已通过推荐链接享有我们的推荐优惠，优惠不可叠加使用。",
  applied: "已使用",
  monthsFree: (free, commitment) => `${commitment}个月计划，免费${free}个月。`,
  monthlyOnly: "仅适用于按月计划。",
  newCustomersOnly: "仅限新客户，需经我们团队确认。",
  subjectToConfirmation: "使用优惠码的价格需经确认。",
  notOnThisPlan: "此优惠码仅适用于按月计划，您所选的计划不包含此优惠。",
  promoLine: (code) => `优惠码 ${code}`,
  promoSaving: (amount, months) => `优惠减免：−$${amount}（共${months}个月）`,
  totalWithPromo: "使用优惠码后的预估总额",
  subjectTo: "（需经确认）",
  floorLimited: "减免额已设上限，确保存储费用每个模块每月不低于 S$55。",
};

export type PromoText = typeof EN;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

/** Texts for the current page language. Server render and first paint use English. */
export function usePromoText(): PromoText {
  const zh = useSyncExternalStore(
    subscribe,
    () => document.documentElement.lang?.toLowerCase().startsWith("zh") ?? false,
    () => false,
  );
  return zh ? ZH : EN;
}
