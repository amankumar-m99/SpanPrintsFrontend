import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesComponent } from './expenses.component';
import { Expense } from '../../model/expense/expense.model';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter expenses by date, source, and amount range', () => {
    const expenses: Expense[] = [
      { id: 1, uuid: '1', expenseType: 'BUSINESS', amount: 1500, description: 'Travel', dateOfExpense: '2025-02-01T10:00:00', ledgerId: 1, ledgerUuid: 'a', updatedAt: '2025-02-01T10:00:00', createdAt: '2025-02-01T10:00:00', createdBy: 'admin', createdById: 1 },
      { id: 2, uuid: '2', expenseType: 'PERSONAL', amount: 2500, description: 'Food', dateOfExpense: '2025-02-15T10:00:00', ledgerId: 1, ledgerUuid: 'a', updatedAt: '2025-02-15T10:00:00', createdAt: '2025-02-15T10:00:00', createdBy: 'admin', createdById: 1 },
      { id: 3, uuid: '3', expenseType: 'BUSINESS', amount: 4500, description: 'Marketing', dateOfExpense: '2025-03-10T10:00:00', ledgerId: 1, ledgerUuid: 'a', updatedAt: '2025-03-10T10:00:00', createdAt: '2025-03-10T10:00:00', createdBy: 'admin', createdById: 1 }
    ];

    component.expenses = expenses;
    component.dateOfExpenseFrom = '2025-02-01';
    component.dateOfExpenseTo = '2025-02-28';
    component.expenseSourceFilter = 'PERSONAL';
    component.amountMin = 2000;
    component.amountMax = 3000;

    const filtered = component.filterExpenses(expenses);

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(2);
  });

  it('should paginate filtered results', () => {
    component.pageSize = 2;
    component.expenses = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      uuid: `uuid-${index + 1}`,
      expenseType: index % 2 === 0 ? 'BUSINESS' : 'PERSONAL',
      amount: (index + 1) * 100,
      description: `Expense ${index + 1}`,
      dateOfExpense: `2025-01-${String((index % 28) + 1).padStart(2, '0')}T00:00:00`,
      ledgerId: 1,
      ledgerUuid: 'ledger-1',
      updatedAt: '2025-01-01T00:00:00',
      createdAt: '2025-01-01T00:00:00',
      createdBy: 'admin',
      createdById: 1
    }));

    component.currentPage = 2;
    component.updateDisplayedExpenses();

    expect(component.totalPages).toBe(3);
    expect(component.paginatedExpenses.length).toBe(2);
    expect(component.paginatedExpenses[0].id).toBe(3);
  });
});
