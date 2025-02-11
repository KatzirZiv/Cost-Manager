# Cost Manager

A modern, responsive web application for tracking personal expenses and visualizing spending patterns. Built with React and utilizing IndexedDB for client-side data storage.

## Features

- 📊 Interactive pie chart visualization of expenses by category
- 📝 Detailed monthly expense reports with sorting and filtering
- 📱 Responsive design that works on both desktop and mobile devices
- 🔍 Advanced search and filtering capabilities
- 📅 Date-based expense tracking and organization
- 💾 Offline-capable with client-side storage using IndexedDB

## Technologies Used

- React - Frontend framework
- Material-UI (MUI) - UI component library
- IndexedDB - Client-side storage
- Recharts - Data visualization
- date-fns - Date manipulation and formatting

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cost-manager.git
cd cost-manager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## Usage

### Adding Expenses

1. Navigate to the "Add New Cost" section
2. Enter the expense amount
3. Select a category from the dropdown menu
4. Add a description
5. Select the date
6. Click "Add Cost" to save the expense

### Viewing Reports

- Use the monthly report table to view all expenses
- Sort expenses by date, category, or amount
- Filter expenses using the search box
- Delete individual expenses using the delete icon

### Analyzing Expenses

- View the pie chart to see expense distribution by category
- Hover over chart segments to see detailed amounts
- Use the date picker to view different months

## Key Components

- `AddCostForm` - Form component for adding new expenses
- `CostChart` - Pie chart visualization component
- `CostReport` - Detailed expense report table
- `CostManagerDB` - IndexedDB database management class

## Data Storage

The application uses IndexedDB for client-side storage with the following structure:

- Database Name: CostManagerDB
- Object Store: costs
- Indexes:
  - date
  - category
  - monthYear


## Acknowledgments

- Material-UI for the beautiful component library
- Recharts for the charting capabilities
- The React community for inspiration and support
