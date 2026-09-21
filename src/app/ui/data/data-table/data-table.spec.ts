import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTable, Column, Row } from './data-table';

const COLUMNS: Column[] = [
  { key: 'date', label: 'DATE' },
  { key: 'entry', label: 'ENTRY' },
];

const ROWS: Row[] = [
  { id: 'hello-world', cells: { date: '2026-01-16', entry: 'Hello, World!' } },
];

describe('DataTable', () => {
  let fixture: ComponentFixture<DataTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DataTable] }).compileComponents();
    fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('rows', ROWS);
    fixture.detectChanges();
  });

  it('renders a header cell per column', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heads = el.querySelectorAll('th');
    expect(heads.length).toBe(2);
    expect(heads[0].textContent?.trim()).toBe('DATE');
  });

  it('renders a row per entry', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
    expect(el.textContent).toContain('Hello, World!');
  });

  it('emits the row id on click', () => {
    let emitted = '';
    fixture.componentInstance.select.subscribe((id: string) => (emitted = id));
    const row = (fixture.nativeElement as HTMLElement).querySelector(
      'tbody tr',
    ) as HTMLElement;
    row.click();
    expect(emitted).toBe('hello-world');
  });

  it('marks the selected row with aria-selected', () => {
    fixture.componentRef.setInput('selectedId', 'hello-world');
    fixture.detectChanges();
    const row = (fixture.nativeElement as HTMLElement).querySelector('tbody tr');
    expect(row?.getAttribute('aria-selected')).toBe('true');
  });

  it('renders no end rule unless endLabel is set', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.data-table__end')).toBeNull();
  });

  it('renders the end rule when endLabel is set', () => {
    fixture.componentRef.setInput('endLabel', '— END OF LOG —');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.data-table__end')?.textContent).toContain('END OF LOG');
  });
});
