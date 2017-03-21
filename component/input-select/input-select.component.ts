import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

@Component({
  moduleId:module.id,
  selector: 'input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.css']
})
export class InputSelectComponent implements OnInit  {

  items: Observable<string>;
  private inputTermStream = new Subject<string>();
  private dataListId:string;
  private allOps: string[];
  private prevSelIdx: number;
  private invalid: boolean;
  @Input() set options(ops: string[]) {
    this.allOps = ops;
  };
  @Input() placeholder: string;
  @Input() disabled: boolean;
  @Output() select: EventEmitter<any> = new EventEmitter();

  constructor() {
    // there may be many input-select elements, and the ids of the inner datalists must be different
    this.dataListId = UUID.UUID();
    this.prevSelIdx = -1;
    this.invalid = false;
  }

  ngOnInit() {
    this.items = this.inputTermStream.debounceTime(300);
    this.items.subscribe(value => this.checkOption(value));
  }

  inputChange(text:string) {
    this.inputTermStream.next(text);
  }

  checkOption(value:string) {
    for (let i=0; i< this.allOps.length; i++) {
      if (value === this.allOps[i]) {
        this.select.emit(i);
        this.prevSelIdx = i;
        this.invalid = false;
        return;
      }
    }
    // no need to change the prevSelIdx and emit -1, as it has been done when clicking on the input
    this.invalid = true;
  }

  onClickInput(elem: HTMLInputElement) {
    elem.value = '';
    this.select.emit(-1);
    this.prevSelIdx = -1;

    // dont't change the invalid state to true here , it may confuse the user if the state changes
    // before user input something.
  }
  /** bind event click instead of change as the change event would not be fired
   * if user select the first option.
   */
  onSelectClick(sel: HTMLSelectElement, input: HTMLInputElement) {
    let i = sel.selectedIndex;
    if (i === -1) {
      this.invalid = true;
    } else {
      this.invalid = false;
    }
    
    if(i !== this.prevSelIdx) {
      this.prevSelIdx = i;
      input.value = this.allOps[i];
      this.select.emit(i);
    }
  }

}
