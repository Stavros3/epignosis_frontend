import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { HeaderComponent } from "src/app/shared/components/header/header.component";

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  standalone: true,
  imports: [IonContent, HeaderComponent]
})
export class CreateUserComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
