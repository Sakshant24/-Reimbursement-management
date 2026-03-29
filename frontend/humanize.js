import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacements = {
  // Layout
  '[ SYS_AUTH ]': 'Reimbursement Portal',
  'LOGGED IN AS:': 'Logged in as:',
  'TERMINATE_SESSION': 'Logout',
  
  // Login
  '> LOGIN_': 'Login',
  'SECURE_TERMINAL_ACCESS': 'Access your account',
  'EMAIL_PARAMETER': 'Email Address',
  'AUTHENTICATION_KEY': 'Password',
  'EXECUTE': 'Log in',
  'NO SYSTEM RECORD?': 'Don\'t have an account?',
  'INIT_COMPANY': 'Sign up now',
  
  // Signup
  '> INIT_ORG_': 'Sign Up',
  'REGISTER_NEW_ENTERPRISE': 'Register your company',
  'FULL_NAME': 'Full Name',
  'EMAIL_PARAM': 'Email Address',
  'COMPANY_ID': 'Company Name',
  'HEADQUARTERS (COUNTRY)': 'Headquarters (Country)',
  'HEADQUARTERS': 'Country',
  'AUTO_DETECTED_CURRENCY': 'Default Currency',
  'ADMIN_AUTH_KEY': 'Password',
  'CREATE_ENTERPRISE': 'Sign Up',
  'SYSTEM RECORD EXISTS?': 'Already have an account?',
  'LOGIN_PORTAL': 'Log in here',
  
  // Employee Dashboard
  '[ EXPENSE_LEDGER ]': 'My Expenses',
  'SYS_USER:': 'User ID:',
  'SUBMIT_NEW': 'New Expense',
  'FETCHING_RECORDS...': 'Loading expenses...',
  'NO_EXPENSES_FOUND_IN_SYSTEM_LOG': 'You have not submitted any expenses.',
  'EXT_DATE': 'Date',
  'CAT_TYPE': 'Category',
  'REQ_AMT': 'Receipt Amount',
  'SYS_CONVERTED': 'Converted Base',
  'DESCRIPTION_LOG': 'Description',
  'TX_ID:': 'Transaction ID:',
  'VIEW_RECEIPT_FILE': 'View Receipt',
  'APPROVAL_TRAIL_TRACE': 'Approval Flow',
  'DECRYPTING_TRAIL...': 'Loading approvals...',
  'COMPANY:': 'Company:',
  
  // Expense Form
  '[ NEW_EXPENSE_CLAIM ]': 'Submit New Expense',
  'OPTIONAL: AI_SCAN_RECEIPT': 'Scan Receipt with AI (Optional)',
  'AMOUNT_VALUE': 'Amount',
  'CURRENCY_CODE': 'Currency Code',
  'CATEGORY': 'Category',
  'TRANSACTION_DATE': 'Transaction Date',
  'MERCHANT_DESCRIPTION': 'Description / Merchant',
  'ABORT': 'Cancel',
  'TRANSMITTING...': 'Submitting...',
  'SUBMIT_CLAIM': 'Submit Expense',
  
  // Manager Dashboard
  '[ MANAGER_QUEUE ]': 'Pending Approvals',
  'ACTION_REQUIRED': 'Action Required',
  'FETCHING_QUEUE...': 'Loading pending approvals...',
  'QUEUE_EMPTY. NO_PENDING_ACTIONS.': 'You have no pending approvals in your queue.',
  'AWAITING_YOUR_DECISION': 'Awaiting Decision',
  'AWAITING_DECISION': 'Pending Approval',
  'SUBMITTED_AMOUNT': 'Original Amount',
  'VIEW_ATTACHED_RECEIPT': 'View Attached Receipt',
  'CHAIN_TRACE': 'Approval Chain',
  'DECISION_LOG_COMMENT': 'Comments (Optional)',
  'AUTHORIZE': 'Approve',
  'REJECT': 'Reject',
  
  // Admin Dashboard
  '[ ADMIN_CONSOLE ]': 'System Admin Dashboard',
  'ELEVATED_PRIVILEGES': 'Elevated Privileges',
  'USER_MANAGEMENT': 'Users',
  'WORKFLOW_RULES': 'Approval Rules',
  'GLOBAL_LEDGER': 'All Expenses',
  
  // Users Tab
  'PROVISION_NEW_USER': 'Create New User',
  'USER_IDENTITY': 'User Info',
  'SYS_ROLE (MODIFY)': 'Role',
  'SYS_ROLE': 'Role',
  'ASSIGNED_MANAGER': 'Manager',
  'PROVISION': 'Create',
  'FETCHING_USER_REGISTRY...': 'Loading users...',
  'N/A (ROOT)': 'Admin (N/A)',
  
  // Rules Tab
  'CONSTRUCT_RULE': 'Create New Rule',
  'ABORT_BUILD': 'Cancel',
  'RULE_IDENTIFIER (NAME)': 'Rule Name',
  'CATEGORY_FILTER': 'Category Filter (Optional)',
  'APPROVER_SEQUENCE_MAP': 'Approver Sequence',
  'ENFORCE_MANAGER_AS_STEP_1': 'Manager must approve first',
  '[ AUTO-LOCKED: DIRECT_MANAGER ]': '[ Direct Manager ]',
  'SELECT_APPROVER_NODE': '-- Select Approver --',
  'REMOVE_NODE': 'Remove',
  'APPEND_SEQUENCE_NODE': 'Add Step',
  'LOGIC_EVALUATION_TYPE': 'Rule Type',
  'THRESHOLD_PERCENTAGE': 'Approval Threshold %',
  'AUTO_APPROVE_IF_APPROVED_BY': 'Auto-Approve if Approved By',
  'COMPILE_RULE_TO_SYSTEM': 'Save Rule',
  'INIT_RULE_BUILDER': 'Create New Rule',
  'FETCHING_WORKFLOW_RULES...': 'Loading workflow rules...',
  'NO_RULES_DETECTED': 'No rules found. Create one above.',
  'PURGE_RULE': 'Delete',
  'MGR_1ST:': 'Manager 1st:',
  'CAT:': 'Category:',
  'TYPE:': 'Type:',
  
  // Expenses tab
  'SYS_TX_ID': 'Tx ID',
  'SUBMITTER': 'Submitter',
  'ROOT_ACTION_OVERRIDE': 'Admin Override',
  'FORCE_APV': 'Approve',
  'FORCE_REJ': 'Reject',
  'SCANNING_GLOBAL_LEDGER...': 'Loading overall ledger...',
  'LEDGER_EMPTY': 'No expenses found in the system.',
  '[SUDO_ACCESS] ENTER REASON TO FORCE': 'Enter override reason for',
  
  // Stepper
  'NO_APPROVAL_STEPS_DEFINED': 'No approval steps configured.',
  'STEP_0': 'Step '
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      for (const [key, value] of Object.entries(replacements)) {
         content = content.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      }
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Successfully humanized terms in all components!');
