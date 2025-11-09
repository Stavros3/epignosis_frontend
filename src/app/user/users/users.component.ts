import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { HeaderComponent } from "src/app/shared/components/header/header.component";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [HeaderComponent, IonContent]
})
export class UsersComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
