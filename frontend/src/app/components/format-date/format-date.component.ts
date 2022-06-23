import { Component, OnInit, Input } from '@angular/core';

function format(date: Date): string {

  /* format times of last month nicely */
  /* other dates are shown in YYYY-MM-DD */

  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  function s(n: number): string {
    /* optional plural 's' */
    return `${n === 1 ? '' : 's'}`;
  }

  function agoSentence(aName, bName, a, b): string {
    if (b === 0) {
      /* 3 weeks ago */
      return `${a} ${aName}${s(a)} ago`;
    }
    /* 1 week and 2 days ago */
    return `${a} ${aName}${s(a)} and ${b} ${bName}${s(b)} ago`;
  }

  /* delta now - then */

  let diff = new Date().getTime() - date.getTime();

  /* case: future */
  /* show ISO 8601 YYYY-MM-DD */

  if (diff < 0) {
    return `${date.toISOString().substring(0, 10)}`;
  }

  /* case: older than 4 weeks */
  /* show ISO 8601 YYYY-MM-DD */

  const weeks = Math.floor(diff / week);

  if (weeks > 4) {
    return `${date.toISOString().substring(0, 10)}`;
  }

  /* case: weeks, days */

  diff = diff % week;
  const days = Math.floor(diff / day);

  if (weeks > 0) {
    return agoSentence('week', 'day', weeks, days);
  }

  /* case: days, hours */

  diff = diff % day;
  const hours = Math.floor(diff / hour);

  if (days > 0) {
    return agoSentence('day', 'hour', days, hours);
  }

  /* case: hours, minutes */

  diff = diff % hour;
  const minutes = Math.floor(diff / minute);

  if (hours > 0) {
    return agoSentence('hour', 'minute', hours, minutes);
  }

  /* case: minutes, seconds */

  diff = diff % minute;
  const seconds = Math.floor(diff / second);
  
  if (minutes > 0) {
    return agoSentence('minute', 'second', minutes, seconds);
  }

  return `${seconds} second${s(seconds)} ago`;
}

@Component({
  selector: 'app-format-date',
  templateUrl: './format-date.component.html',
  styleUrls: ['./format-date.component.css']
})
export class FormatDateComponent implements OnInit {

  @Input() date: string;

  isoString = "";
  formatted = "";

  constructor() { }

  ngOnInit(): void {
    this.isoString = new Date(this.date).toISOString();
    this.formatted = format(new Date(this.date));
  }
}
