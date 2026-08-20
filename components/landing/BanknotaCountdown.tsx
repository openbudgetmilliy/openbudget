'use client';

import Countdown from '@/components/landing/Countdown';

import s from './BanknotaCountdown.module.css';

/** `/9` banknota sahifasi uchun taymer — stillar client chegarasida */
export default function BanknotaCountdown({ initial }: { initial: number }) {
  return (
    <Countdown
      initial={initial}
      lead=""
      classes={{
        root: s.cd,
        cell: s.cdCell,
        num: s.cdNum,
        lab: s.cdLab,
      }}
    />
  );
}
