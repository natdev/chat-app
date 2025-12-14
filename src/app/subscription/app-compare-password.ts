import { Directive, forwardRef, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appComparePassword]',
  providers: [
    { provide: NG_VALIDATORS, 
      useExisting: forwardRef(() => AppComparePassword), 
      multi: true }
  ],
  standalone: true
})
export class AppComparePassword implements Validator {
  @Input() passwordToCompare!: AbstractControl;

  validate(control: AbstractControl): ValidationErrors | null {
    
    if (control && control.value !== this.passwordToCompare.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }
}
