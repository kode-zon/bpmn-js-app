import { Component, EventEmitter, Output } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-config',
  standalone: false,
  
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {


  @Output() event = new EventEmitter<string>();


  constructor() {
  }

  get config_runtime_data() {
    return AppService.config_runtime_data;
  }

  addItem() {
    this.repoConfigs.push({ authType: "Bearer" ,hideSecrets: true })
  }

  get repoConfigs() {
    return AppService.repoConfigs
  }
  set repoConfigs(value) {
    AppService.repoConfigs = value;
  }

  emitActionEvent(name:string) {
    this.event.emit(name);
  }

  
}

export type RepoConfig = {
  domain?: string,
  repoType?: "GitLab"|"CORS"
  authType?: "None"|"Bearer"|"Basic"|"GitLabPrivate",
  token?: string,
  user?: string,
  pass?: string,
  hideSecrets: boolean
}
