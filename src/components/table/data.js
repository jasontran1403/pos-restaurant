const STATUS_IN_PROGRESS = { id: 0, name: "RUNNING", color: "blue.300" };

const STATUS_IN_CANCEL = {
  id: 1,
  name: "CANCELED",
  color: "red.400",
};
const STATUS_IN_PENDING = {
  id: 2,
  name: "PENDING",
  color: "yello.400",
};
const STATUS_IN_SUCCESS = {
  id: 3,
  name: "SUCCESS",
  color: "green.400",
};
export const STATUSES = [
  STATUS_IN_PROGRESS,
  STATUS_IN_CANCEL,
  STATUS_IN_PENDING,
  STATUS_IN_SUCCESS
];

const DATA = [
  {
    code: "Add a New Feature",
    status: STATUS_IN_CANCEL,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Write Integration Tests",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Add Instagram Integration",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Cleanup Database",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/02/15"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Refactor API Endpoints",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Add Documentation to API",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/09/12"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Update NPM Packages",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Optimize Database Queries",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Implement User Authentication",
    status: STATUS_IN_CANCEL,
    date: new Date("2023/11/08"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Design User Interface Mockups",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/09/30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Fix Cross-Browser Compatibility Issues",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Perform Security Audit",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/10/22"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Create User Onboarding Tutorial",
    status: STATUS_IN_CANCEL,
    date: new Date("2023/11/15"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Optimize Frontend Performance",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Conduct Code Review",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/10/05"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Implement Continuous Integration",
    status: STATUS_IN_CANCEL,
    date: new Date("2023/11/01"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Migrate to Cloud Hosting",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Create User Feedback Survey",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/09/25"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Update User Documentation",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Bug Fixing and QA Testing",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/10/10"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Implement Mobile App Support",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023-10-15T14:29:30"),
    reward: "0.5%",
    capital: "2000",
  },
  {
    code: "Refine User Permission System",
    status: STATUS_IN_PROGRESS,
    date: new Date("2023/09/18"),
    reward: "0.5%",
    capital: "2000",
  },
];

export default DATA;
