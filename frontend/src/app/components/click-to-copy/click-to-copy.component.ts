import { Component, Input, OnInit } from '@angular/core';

import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-click-to-copy',
  templateUrl: './click-to-copy.component.html',
  styleUrls: ['./click-to-copy.component.css']
})
export class ClickToCopyComponent implements OnInit {

  /* if text is not supplied the innerText of this component will be used */
  @Input() text: string;

  constructor(
    private flashmessage: FlashmessageService,
  ) { }

  ngOnInit(): void {
  }

  click(content): void {
    const text = this.text ? this.text : content.innerText;
    document.addEventListener('copy', (event: ClipboardEvent) => {
      event.clipboardData.setData('text/plain', (text));
      event.preventDefault();

      document.removeEventListener('copy', null);
    });

    document.execCommand('copy');

    this.flashmessage.userSuccess('Copied to clipboard!');
  }
}
