export const getFriendlyErrorMessage = (error: any): string => {
  if (!error) return "Се случи непозната грешка. Ве молиме обидете се повторно.";

  const code = error.code || (error.message && error.message.includes('{') ? JSON.parse(error.message).error : error.message);

  // Auth Errors
  if (code === 'auth/invalid-email') return "Внесената е-пошта не е во правилен формат. Проверете ја и обидете се повторно.";
  if (code === 'auth/user-disabled') return "Вашиот кориснички профил е оневозможен. Контактирајте ја поддршката за помош.";
  if (code === 'auth/user-not-found') return "Не постои корисник со оваа е-пошта. Проверете дали правилно сте ја внеле.";
  if (code === 'auth/wrong-password') return "Внесовте погрешна лозинка. Обидете се повторно или ресетирајте ја лозинката.";
  if (code === 'auth/email-already-in-use') return "Оваа е-пошта веќе е регистрирана. Обидете се да се најавите.";
  if (code === 'auth/weak-password') return "Лозинката е премногу слаба. Мора да содржи најмалку 6 карактери.";
  if (code === 'auth/operation-not-allowed') return "Овој начин на најава моментално не е овозможен.";
  if (code === 'auth/popup-closed-by-user') return "Прозорецот за најава беше затворен пред да заврши процесот.";
  if (code === 'auth/requires-recent-login') return "Поради безбедносни причини, мора повторно да се најавите за оваа акција.";
  if (code === 'auth/invalid-credential') return "Невалидни податоци за најава. Проверете ја е-поштата и лозинката.";
  if (code === 'auth/network-request-failed') return "Имате проблем со интернет конекцијата. Проверете ја мрежата и обидете се повторно.";
  if (code === 'auth/missing-password') return "Ве молиме внесете лозинка.";
  if (code === 'auth/too-many-requests') return "Премногу неуспешни обиди. Вашиот пристап е привремено блокиран. Обидете се подоцна.";
  if (code === 'auth/account-exists-with-different-credential') return "Веќе постои профил со оваа е-пошта преку друг начин на најава (на пр. Google).";
  if (code === 'auth/unauthorized-domain') return "Оваа веб-страна не е авторизирана за пријава. Контактирајте го администраторот на апликацијата.";
  if (code === 'auth/invalid-api-key') return "Конфигурацијата на апликацијата е неправилна. Ве молиме контактирајте го администраторот.";
  if (code === 'auth/app-not-authorized') return "Апликацијата не е авторизирана. Ве молиме контактирајте го администраторот.";
  if (code === 'auth/cors-unsupported') return "Проблем со безбедносната конфигурација. Ве молиме контактирајте го администраторот.";

  // Firestore Errors
  if (code && (code.includes('permission-denied') || code.includes('Missing or insufficient permissions'))) {
    return "Немате соодветни дозволи за оваа акција. Ве молиме контактирајте нè доколку сметате дека ова е грешка.";
  }
  if (code && code.includes('unavailable')) return "Серверот е моментално преоптоварен или недостапен. Ве молиме обидете се за неколку минути.";
  if (code && code.includes('not-found')) return "Бараните податоци не се пронајдени на серверот.";
  if (code && code.includes('quota-exceeded')) return "Дневниот лимит на апликацијата е надминат. Ве молиме обидете се повторно утре.";
  if (code && code.includes('internal')) return "Внатрешна грешка на серверот. Ве молиме обидете се повторно.";
  if (code && code.includes('data-loss')) return "Имаше проблем со пристапот до податоците. Ве молиме обидете се повторно.";

  // Default
  if (typeof code === 'string' && code.length > 0) {
    if (code.startsWith('auth/') || code.startsWith('firestore/')) return `Грешка: ${code}`;
    return code;
  }

  return "Се случи неочекувана грешка. Ве молиме обидете се повторно подоцна.";
};
