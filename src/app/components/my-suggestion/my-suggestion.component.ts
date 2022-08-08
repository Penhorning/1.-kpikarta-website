import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { SuggestionService } from './service/suggestion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-suggestion',
  templateUrl: './my-suggestion.component.html',
  styleUrls: ['./my-suggestion.component.scss']
})
export class MySuggestionComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  submitted: boolean = false;
  submitFlag: boolean = false;
  deleteFlag: boolean = false;
  isLoading: boolean = false;

  phases: any = [];
  suggestion: any;

  suggestionForm = this.fb.group({
    definition: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
    descriptions: this.fb.array([]) 
  });

  get descriptions(): FormArray {
    return this.suggestionForm.controls["descriptions"] as FormArray;
  }

  constructor(private fb: FormBuilder, private _commonService: CommonService, private _suggestionService: SuggestionService) { }

  ngOnInit(): void {
    this.getKartaPhases();
  }

  patchForm() {
    this.suggestionForm.patchValue({
      definition: this.suggestion.definition,
    });
    this.suggestion.descriptions.forEach((item: any) => {
      const descriptionForm = this.fb.group({
        description: [{value: item.description, disabled: true}, [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
      });
      this.descriptions.push(descriptionForm);
    });
  }

  getKartaPhases() {
    this.isLoading = true;
    this._suggestionService.getPhases().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.phases = response;
        this.getSuggestion(this.phases[0].id);
      },
      (error: any) => {
        this.isLoading = false;
      }
    );
  }

  getSuggestion(id: string) {
    let data = {
      userId: this._commonService.getUserId(),
      phaseId: id
    }
    this._suggestionService.getSuggestion(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.suggestionForm.reset();
        this.descriptions.clear();
        this.suggestion = response;
        this.patchForm();
      },
      (error: any) => { }
    ).add(() => this.isLoading = false);
  }

  onPhaseChange(phaseId: string) {
    this.getSuggestion(phaseId); 
  }

  enableDescription(descriptionIndex: number) {
    this.descriptions.at(descriptionIndex).enable();
  }

  addDescriptions() {
    if (this.suggestionForm.controls["descriptions"].status !== "INVALID") {
      const descriptionForm = this.fb.group({
        description: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
      });
      this.descriptions.push(descriptionForm);
      setTimeout(()=> {
        document.getElementById("textarea"+(this.descriptions.length-1))?.focus();
      }, 100);
    }
  }

  removeDescription(descriptionIndex: number) {
    this.descriptions.removeAt(descriptionIndex);
  }

  onSubmit() {
    this.submitted = true;
    
    if ((this.suggestionForm.valid && this.suggestionForm.touched && this.suggestionForm.dirty) || (this.suggestionForm.valid && this.suggestion.descriptions.length != this.descriptions.length)) {

      this.submitFlag = true;

      if (this.suggestion.hasOwnProperty("userId")) {
        this._suggestionService.updateSuggestion(this.suggestionForm.getRawValue(), this.suggestion.id).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            this._commonService.successToaster("Suggestion added successfully");
            this.submitted = false;
            this.suggestionForm.reset();
            this.descriptions.clear();
            this.suggestion = response;
            this.patchForm();
          },
          (error: any) => { }
        ).add(() => { this.submitFlag = false });
      } else {
        this.suggestionForm.value.userId = this._commonService.getUserId();
        this.suggestionForm.value.phaseId = this.suggestion.phaseId;
        this.suggestionForm.value.descriptions = this.suggestionForm.getRawValue().descriptions;
        
        this._suggestionService.createSuggestion(this.suggestionForm.value).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            this._commonService.successToaster("Suggestion added successfully");
            this.submitted = false;
            this.suggestionForm.reset();
            this.descriptions.clear();
            this.suggestion = response;
            this.patchForm();
          },
          (error: any) => { }
        ).add(() => { this.submitFlag = false });
      }
    }
  }

  deleteSuggestion() {
    const phase = this.phases.filter((item: any) => item.id === this.suggestion.phaseId);

    const result = confirm(`Are you sure, you want to reset your "${phase[0].name}" suggestions?`);
    if (result) {
      this.deleteFlag = true;
      if (!this.suggestion.hasOwnProperty("userId")) {
        this._commonService.successToaster("Suggestion reset successfully");
        this.deleteFlag = false;
        this.ngOnInit();
      } else {
        this._suggestionService.deleteSuggestion(this.suggestion.id).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            this.getSuggestion(this.suggestion.phaseId);
            this._commonService.successToaster("Suggestion reset successfully");
          },
          (error: any) => { }
        ).add(() => { this.deleteFlag = false });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
