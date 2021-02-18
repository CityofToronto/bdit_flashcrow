/**
 * Columns for `<FcDataTableRequests>`.
 *
 * For entries here with `text: ''`, the corresponding column in `<FcDataTableRequests>` will
 * have an empty header.  This is intentional, as it helps limit on-screen text to only what's
 * necessary for navigation and usability.  However, it's also an a11y issue - screen reader
 * users rely on column header text to understand the context of table cells.
 *
 * To address that, ensure that you define a corresponding `header.${column.name}` slot.  In
 * this slot, include `<span class="sr-only"></span>` text that provides adequate context to
 * screen reader users.
 */
const RequestDataTableColumns = [
  { value: 'SELECT', text: '' },
  { value: 'ID', text: 'ID' },
  { value: 'LOCATION', text: 'Location' },
  /*
   * `data-table-expand` is a special column name, used to include expansion controls in
   * tables with information nested accordion-style in rows.
   *
   * In this case, we use this slot for bulk study requests.
   */
  { value: 'data-table-expand', text: '' },
  { value: 'STUDY_TYPE', text: 'Type' },
  { value: 'REQUESTER', text: 'Requester' },
  { value: 'CREATED_AT', text: 'Date Created' },
  { value: 'ASSIGNED_TO', text: 'Assigned To' },
  { value: 'DUE_DATE', text: 'Due Date' },
  { value: 'STATUS', text: 'Status' },
  { value: 'LAST_EDITED_AT', text: 'Last Updated' },
  { value: 'ACTIONS', text: '' },
];

export default RequestDataTableColumns;
