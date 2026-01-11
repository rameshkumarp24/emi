

import React, { useState } from 'react';
import './App.css';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
  Tabs, Tab, Box, Slider, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButton, ToggleButtonGroup, Divider
} from '@mui/material';

Chart.register(ArcElement, Tooltip, Legend);

const loanTypes = [
  {
    label: 'Home Loan',
    min: 100000,
    max: 20000000,
    step: 10000,
    default: 5000000,
  },
  {
    label: 'Personal Loan',
    min: 50000,
    max: 5000000,
    step: 5000,
    default: 500000,
  },
  {
    label: 'Car Loan',
    min: 100000,
    max: 5000000,
    step: 10000,
    default: 1000000,
  },
];

function calculateEMI(P, r, n) {
  const monthlyRate = r / 12 / 100;
  if (monthlyRate === 0) return P / n;
  return (
    (P * monthlyRate * Math.pow(1 + monthlyRate, n)) /
    (Math.pow(1 + monthlyRate, n) - 1)
  );
}

function getAmortizationSchedule(P, r, n, startYear, mode) {
  // mode: 'year' or 'month'
  const monthlyRate = r / 12 / 100;
  const emi = calculateEMI(P, r, n);
  let balance = P;
  let schedule = [];
  let year = startYear;
  for (let i = 1; i <= n; i++) {
    const interest = balance * monthlyRate;
    const principal = emi - interest;
    balance -= principal;
    if (mode === 'year') {
      const y = year + Math.floor((i - 1) / 12);
      if (!schedule[y]) {
        schedule[y] = {
          year: y,
          principal: 0,
          interest: 0,
          total: 0,
          balance: 0,
          paidPercent: 0,
        };
      }
      schedule[y].principal += principal;
      schedule[y].interest += interest;
      schedule[y].total += emi;
      schedule[y].balance = Math.max(balance, 0);
      schedule[y].paidPercent = 100 * (P - balance) / P;
    } else {
      // month-wise
      const m = i;
      schedule[m] = {
        month: m,
        year: year + Math.floor((i - 1) / 12),
        principal: principal,
        interest: interest,
        total: emi,
        balance: Math.max(balance, 0),
        paidPercent: 100 * (P - balance) / P,
      };
    }
  }
  // Convert to array and round values
  return Object.values(schedule).map((row) => ({
    ...row,
    principal: Math.round(row.principal),
    interest: Math.round(row.interest),
    total: Math.round(row.total),
    balance: Math.round(row.balance),
    paidPercent: row.paidPercent?.toFixed(2),
  }));
}

function App() {
  const [tab, setTab] = useState(0);
  const [loanAmount, setLoanAmount] = useState(loanTypes[0].default);
  const [interestRate, setInterestRate] = useState(9);
  const [tenure, setTenure] = useState(20);
  const [tenureMode, setTenureMode] = useState('year');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [scheduleMode, setScheduleMode] = useState('year');

  React.useEffect(() => {
    setLoanAmount(loanTypes[tab].default);
  }, [tab]);

  const tenureMonths = tenureMode === 'year' ? tenure * 12 : tenure;
  const emi = Math.round(calculateEMI(loanAmount, interestRate, tenureMonths));
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  const pieData = {
    labels: ['Principal Loan Amount', 'Total Interest'],
    datasets: [
      {
        data: [loanAmount, totalInterest],
        backgroundColor: ['#8bc34a', '#ff9800'],
        borderWidth: 1,
      },
    ],
  };

  const schedule = getAmortizationSchedule(loanAmount, interestRate, tenureMonths, startYear, scheduleMode);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700 }}>EMI Calculator for Home Loan, Car Loan & Personal Loan in India</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
        {loanTypes.map((type, idx) => (
          <Tab key={type.label} label={type.label} />
        ))}
      </Tabs>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
        <Box sx={{ flex: 1, minWidth: 340, p: 3, background: '#f5faff', borderRadius: 2, boxShadow: 1 }}>
          <Typography gutterBottom sx={{ fontWeight: 600 }}>Loan Amount</Typography>
          <Slider
            min={loanTypes[tab].min}
            max={loanTypes[tab].max}
            step={loanTypes[tab].step}
            value={loanAmount}
            onChange={(_, v) => setLoanAmount(v)}
            valueLabelDisplay="auto"
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            value={loanAmount}
            onChange={e => setLoanAmount(Number(e.target.value))}
            InputProps={{ startAdornment: <span>₹</span> }}
            sx={{ mb: 2 }}
          />
          <Typography gutterBottom sx={{ fontWeight: 600 }}>Interest Rate (%)</Typography>
          <Slider
            min={5}
            max={20}
            step={0.1}
            value={interestRate}
            onChange={(_, v) => setInterestRate(v)}
            valueLabelDisplay="auto"
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            value={interestRate}
            onChange={e => setInterestRate(Number(e.target.value))}
            InputProps={{ endAdornment: <span>%</span> }}
            sx={{ mb: 2 }}
          />
          <Typography gutterBottom sx={{ fontWeight: 600 }}>Loan Tenure</Typography>
          <ToggleButtonGroup
            value={tenureMode}
            exclusive
            onChange={(_, v) => v && setTenureMode(v)}
            sx={{ mb: 1 }}
          >
            <ToggleButton value="year">Year</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
          <Slider
            min={tenureMode === 'year' ? 1 : 12}
            max={tenureMode === 'year' ? 30 : 360}
            step={1}
            value={tenure}
            onChange={(_, v) => setTenure(v)}
            valueLabelDisplay="auto"
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            value={tenure}
            onChange={e => setTenure(Number(e.target.value))}
            InputProps={{ endAdornment: <span>{tenureMode === 'year' ? 'Yr' : 'Mo'}</span> }}
            sx={{ mb: 2 }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 340, p: 3, background: '#fffde7', borderRadius: 2, boxShadow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Loan EMI</Typography>
          <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>₹ {emi.toLocaleString()}</Typography>
          <Divider sx={{ my: 2, width: '80%' }} />
          <Typography sx={{ mt: 1, fontWeight: 600 }}>Total Interest Payable</Typography>
          <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>₹ {totalInterest.toLocaleString()}</Typography>
          <Typography sx={{ mt: 1, fontWeight: 600 }}>Total Payment (Principal + Interest)</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>₹ {totalPayment.toLocaleString()}</Typography>
          <Box sx={{ mt: 3, maxWidth: 260, mx: 'auto' }}>
            <Pie data={pieData} options={{ plugins: { legend: { display: true, position: 'bottom' } } }} />
            <Typography align="center" sx={{ mt: 1, fontWeight: 600 }}>Break-up of Total Payment</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 5, p: 3, background: '#e3f2fd', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Schedule showing EMI payments starting from {startYear}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            type="number"
            label="Start Year"
            value={startYear}
            onChange={e => setStartYear(Number(e.target.value))}
            sx={{ width: 120 }}
          />
          <ToggleButtonGroup
            value={scheduleMode}
            exclusive
            onChange={(_, v) => v && setScheduleMode(v)}
          >
            <ToggleButton value="year">Year-wise</ToggleButton>
            <ToggleButton value="month">Month-wise</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {scheduleMode === 'year' ? (
                  <>
                    <TableCell>Year</TableCell>
                    <TableCell>Principal (A)</TableCell>
                    <TableCell>Interest (B)</TableCell>
                    <TableCell>Total Payment (A+B)</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Loan Paid To Date</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Month</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Principal (A)</TableCell>
                    <TableCell>Interest (B)</TableCell>
                    <TableCell>Total Payment (A+B)</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Loan Paid To Date</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {schedule.map((row, idx) => (
                <TableRow key={scheduleMode === 'year' ? row.year : row.month}>
                  {scheduleMode === 'year' ? (
                    <>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>₹ {row.principal.toLocaleString()}</TableCell>
                      <TableCell>₹ {row.interest.toLocaleString()}</TableCell>
                      <TableCell>₹ {row.total.toLocaleString()}</TableCell>
                      <TableCell>₹ {row.balance.toLocaleString()}</TableCell>
                      <TableCell>{row.paidPercent}%</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{row.month}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>₹ {row.principal.toLocaleString()}</TableCell>
                      <TableCell>₹ {row.interest.toLocaleString()}</TableCell>
                      <TableCell>₹ {row.total.toLocaleString()}</TableCell>
                      <TableCell>₹ {row.balance.toLocaleString()}</TableCell>
                      <TableCell>{row.paidPercent}%</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default App;
