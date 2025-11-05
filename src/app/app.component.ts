import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    InputTextModule,
    ButtonModule,
    MessageModule,
    ReactiveFormsModule,
    TableModule,
    Select,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  registrationForm: FormGroup;
  allowedDomains: string[] = ['edu.com', 'university.edu'];
  users: Array<{ firstName: string; lastName: string; email: string; university: string }> = [];
  universities = [
    { label: 'Harvard University', value: 'Harvard University' },
    { label: 'Stanford University', value: 'Stanford University' },
    { label: 'MIT', value: 'MIT' },
    { label: 'Oxford University', value: 'Oxford University' },
    { label: 'Cambridge University', value: 'Cambridge University' },
    { label: 'Yale University', value: 'Yale University' },
    { label: 'Princeton University', value: 'Princeton University' },
  ];

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['',[Validators.required,Validators.email,this.allowedDomainValidator(this.allowedDomains),],],
      university: ['', [Validators.required]],
    });
  }

  allowedDomainValidator(domains: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;

      if (!value) {
        return null;
      }
      const atIndex = value.lastIndexOf('@');
      if (atIndex === -1) {
        return null;
      }
      const domain = value.substring(atIndex + 1).toLowerCase();
      const normalizedDomains = domains.map(d => d.toLowerCase());
      const isAllowed = normalizedDomains.includes(domain);
      return isAllowed ? null : { domainNotAllowed: true };
    };
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
  
    const formValue = this.registrationForm.value;
    const email = formValue.email;
    const isDuplicate = this.users.some(user => user.email === email);
  
    if (isDuplicate) {
      const emailControl = this.registrationForm.get('email');
      const existingErrors = emailControl?.errors || {};
      emailControl?.setErrors({ ...existingErrors, duplicate: true });
      emailControl?.markAsTouched();

      return;
    }

    this.users.push(formValue);
    console.log('User added:', formValue);
    console.log('All users:', this.users);
    this.registrationForm.reset();
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    console.log(field?.errors);
  
    if (field?.touched && field?.invalid) {
      if (field.errors?.['required']) {
        return 'This field is required';
      }
      if (field.errors?.['minlength']) {
        return 'Minimum length is 2 characters';
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email';
      }
      if (field.errors?.['duplicate']) {
        return 'This email is already registered.';
      }
      if (field.errors?.['domainNotAllowed']) {
        return 'Email domain not allowed';
      }
    }
    return '';
  }

  removeUser(index: number): void {
    const removedUser = this.users[index];
    const confirmDelete = confirm(`Are you sure you want to delete ${removedUser.email}?`);
    if (!confirmDelete) return;
    this.users.splice(index, 1);
    console.log(`User deleted: ${removedUser.email}`);
  }
}
