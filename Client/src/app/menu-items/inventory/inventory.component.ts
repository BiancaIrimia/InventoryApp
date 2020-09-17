import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InventoryListService } from '../../app-logic/inventory-list.service';
import { InventoryItem } from '../../app-logic/inventory-item';
import { SelectionModel } from '@angular/cdk/collections';
import { finalize, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  inventoryItems: InventoryItem[];
  inventoryColumns: string[] = [
    'select',
    'id',
    'name',
    'description',
    'user',
    'location',
    'inventoryNumber',
    'createdAt',
    'modifiedAt',
    'active',
    'actions',
  ];
  selection = new SelectionModel<InventoryItem>(true, []);
  isLoading: boolean;
  activeOnly$=new BehaviorSubject(false);
  itemsCount = 0;

  get activeOnly():boolean{
    return this.activeOnly$.value;
  }
  set activeOnly(v:boolean){
    this.activeOnly$.next(v);
  }

  constructor(
    private inventoryListService: InventoryListService
  ) {}

  ngOnInit(): void {
    // this.inventoryItems = new MatTableDataSource<InventoryItem>(
    //   this.inventoryListMockService.getData()
    // );
    // this.inventoryItems.paginator = this.paginator;
    // this.inventoryItems.sort = this.sort;

   merge(this.sort.sortChange, this.activeOnly$)
   .subscribe(() => {
     this.paginator.pageIndex = 0;
   })

   merge(this.paginator.page, this.sort.sortChange, this.activeOnly$)
   .subscribe(()=> {
    this.selection.clear()
   })

    merge(this.paginator.page, this.sort.sortChange, this.activeOnly$)
    .pipe(
      switchMap(() => {
        this.isLoading = true;
        return this.inventoryListService
          .getData(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            this.activeOnly,
            this.sort.active
              ? `${this.sort.active}_${this.sort.direction ? this.sort.direction : 'asc'}`
              : ''
          )
      })
    )
    .subscribe(
      (data) => {
        this.inventoryItems = data[0];
        this.itemsCount = data[1];
        this.isLoading = false;
      },
      (error) => {
        console.log('Table could not be filled with data', error);
        this.isLoading = false;
      }
    );
  }

  private fetchData() {
    this.isLoading = true;
    this.inventoryListService
      .getData(
        this.paginator.pageIndex + 1,
        this.paginator.pageSize,
        this.activeOnly,
        this.sort.active
          ? `${this.sort.active}_${this.sort.direction ? this.sort.direction : 'asc'}`
          : ''
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (data) => {
          this.inventoryItems = data[0];
          this.itemsCount = data[1];
        },
        (error) => {
          console.log('Table could not be filled with data', error);
        }
      );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.inventoryItems.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.inventoryItems.forEach((row) => this.selection.select(row));
  }


}
