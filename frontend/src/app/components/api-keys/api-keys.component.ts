 import { Component, OnInit, Input } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ApiKeyService, ApiKey, OtherUserApiKey } from '../../services/api-key.service';
import { FlashmessageService } from '../../services/flashmessage.service';

@Component({
  selector: 'app-api-keys',
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.css']
})
export class ApiKeysComponent implements OnInit {
  @Input() allUsers: boolean;

  apiKeys: any[] = [];
  justAdded: ApiKey;
  addName: string;

  constructor(
    private apiKeyService: ApiKeyService,
    private flashmessage: FlashmessageService,

    public modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    let observable;
    if (this.allUsers) {
      observable = this.apiKeyService.listAll();
    } else {
      observable = this.apiKeyService.list();
    }

    observable.subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Getting Api Keys failed: ${res.msg}`);
        return;
      }
      if (this.allUsers) {
        this.apiKeys = res.otherUserApiKeys;
      } else {
        this.apiKeys = res.apiKeys;
      }
    }, err => {
      this.flashmessage.serviceError('Getting Api Keys failed for a network issue.');
      return false;
    });

    this.addName = "Unnamed";
  }

  onAdd(content): void {
    this.justAdded = null;
    this.modalService.open(content, { size: 'lg' });

    this.apiKeyService.add(this.addName).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Adding Api Key failed: ${res.msg}`);
        return;
      }
      this.justAdded = res.apiKey;
      this.apiKeys.push(res.apiKey);
    }, err => {
      this.flashmessage.serviceError('Adding Api Key failed for a network issue.');
      return false;
    });
  }

  onDelete(_id): void {
    this.apiKeyService.delete(_id).subscribe(res => {
      if (!res.success) {
        this.flashmessage.serviceError(`Deleting Api Key failed: ${res.msg}`);
        return;
      }
      this.apiKeys = this.apiKeys.filter(a => a._id !== _id);
    }, err => {
      this.flashmessage.serviceError('Adding Api Key failed for a network issue.');
      return false;
    });
  }
}
