import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { SuggestionService } from './service/suggestion.service';

@Component({
  selector: 'app-my-suggestion',
  templateUrl: './my-suggestion.component.html',
  styleUrls: ['./my-suggestion.component.scss']
})
export class MySuggestionComponent implements OnInit {

  submitted: boolean = false;
  submitFlag: boolean = false;
  deleteFlag: boolean = false;
  isLoading: boolean = false;

  phases: any = [];
  suggestion: any;

  suggestionForm = this.fb.group({
    definition: ['', Validators.required], // Validtion for blank space
    descriptions: this.fb.array([]) 
  });
  selectedPhaseId: string;

  get descriptions(): FormArray {
    return this.suggestionForm.controls["descriptions"] as FormArray;
  }

  config = {
    toolbarGroups: [
      { name: 'basicstyles', groups: [ 'basicstyles' ] },
      { name: 'paragraph', groups: [ 'list' ] }
    ],
    removeButtons: "Strike,Subscript,Superscript",
    versionCheck : false
  }

  constructor(private fb: FormBuilder, private _commonService: CommonService, private _suggestionService: SuggestionService) { }

  ngOnInit(): void {
    this.getKartaPhases();

    setTimeout(() => {
      this.getKartaPhases();
    }, 500);
  }

  patchForm() {
    setTimeout(() => {
      this.suggestionForm.patchValue({
        definition: this.suggestion?.definition,
      });
      this.suggestion?.descriptions.forEach((item: any) => {
        const descriptionForm = this.fb.group({
          description: [{value: item.description, disabled: true}, [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
        });
        this.descriptions.push(descriptionForm);
      });
    }, 100);
  }

  getKartaPhases() {
    this.isLoading = true;
    this._suggestionService.getPhases().subscribe(
      (response: any) => {
        this.phases = response;
        this.selectedPhaseId = this.phases[0].id;
        this.getSuggestion(this.phases[0].id);
      }).add(() => this.isLoading = false );
  }

  getSuggestion(id: string) {
    let data = {
      userId: this._commonService.getUserId(),
      phaseId: id
    }
    this._suggestionService.getSuggestion(data).subscribe(
      (response: any) => {
        // this.suggestionForm.reset();
        this.descriptions.clear();
        this.suggestion = response.suggestion;
        this.patchForm();
      }
    ).add(() => this.isLoading = false);
  }

  onPhaseChange(phaseId: string) {
    this.selectedPhaseId = phaseId;
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
  
    if ((this.suggestionForm.valid && this.suggestionForm.touched && this.suggestionForm.dirty) ||(this.suggestionForm.valid && this.suggestion.descriptions.length !== this.descriptions.length)) {
      this.submitFlag = true;
  
      const suggestionData = {
        ...this.suggestionForm.getRawValue(),
        userId: this.suggestion?.userId || this._commonService.getUserId(),
        phaseId: this.suggestion?.phaseId || this.selectedPhaseId,
      };
  
      if (this.suggestion && this.suggestion.hasOwnProperty('userId')) {
        this._suggestionService.updateSuggestion(suggestionData, this.suggestion.id).subscribe(
          (response: any) => {
            this._commonService.successToaster('Suggestion added successfully');
            this.suggestion = response;
            this.patchForm(); // Reflect updated values in the form
            this.submitted = false;
          },
          (error: any) => {
            console.error(error);
          }
        ).add(() => {
          this.submitFlag = false;
        });
      } else {
        // If new suggestion, create it
        this._suggestionService.createSuggestion(suggestionData).subscribe(
          (response: any) => {
            this._commonService.successToaster('Suggestion added successfully');
            this.suggestion = response;
            this.patchForm(); // Reflect updated values in the form
            this.submitted = false;
          },
          (error: any) => {
            console.error(error);
          }
        ).add(() => {
          this.submitFlag = false;
        });
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
        this._suggestionService.deleteSuggestion(this.suggestion.id).subscribe(
          (response: any) => {
            this.getSuggestion(this.suggestion.phaseId);
            this._commonService.successToaster("Suggestion reset successfully");
          },
          (error: any) => { }
        ).add(() => { this.deleteFlag = false });
      }
    }
  }

}
