import { Component, OnInit } from '@angular/core';

import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-flashmessage',
  templateUrl: './flashmessage.component.html',
  styleUrls: ['./flashmessage.component.css']
})
export class FlashmessageComponent implements OnInit {

  messages: String[] = [];

  constructor(
    private flashmessage: FlashmessageService,
  ) { }

  ngOnInit(): void {
    this.flashmessage.messages.subscribe(messages => {
      this.messages = messages;
    })
  }

}
