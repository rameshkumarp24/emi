

import React, { useState } from 'react';
import './App.css';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
  Tabs, Tab, Box, Slider, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButton, ToggleButtonGroup, Divider, IconButton, Collapse
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

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

// Returns { years: [...], monthsByYear: { [year]: [...] } }
function getAmortizationSchedule(P, r, n, startYear) {
  const monthlyRate = r / 12 / 100;
  const emi = calculateEMI(P, r, n);
  let balance = P;
  let years = [];
  let monthsByYear = {};
  let year = startYear;
  for (let i = 1; i <= n; i++) {
    const interest = balance * monthlyRate;
    const principal = emi - interest;
    balance -= principal;
    const y = year + Math.floor((i - 1) / 12);
    const m = ((i - 1) % 12) + 1;
    // Month row
    if (!monthsByYear[y]) monthsByYear[y] = [];
    monthsByYear[y].push({
      month: m,
      monthName: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][(m-1)%12],
      principal: Math.round(principal),
      interest: Math.round(interest),
      total: Math.round(emi),
      balance: Math.round(Math.max(balance, 0)),
      paidPercent: ((P - balance) / P * 100).toFixed(2),
    });
    // Year row
    if (!years.find(row => row.year === y)) {
      years.push({
        year: y,
        principal: 0,
        interest: 0,
        total: 0,
        balance: 0,
        paidPercent: 0,
      });
    }
    let yr = years.find(row => row.year === y);
    yr.principal += principal;
    yr.interest += interest;
    yr.total += emi;
    yr.balance = Math.max(balance, 0);
    yr.paidPercent = ((P - balance) / P * 100).toFixed(2);
  }
  // Round year values
  years = years.map(row => ({
    ...row,
    principal: Math.round(row.principal),
    interest: Math.round(row.interest),
    total: Math.round(row.total),
    balance: Math.round(row.balance),
    paidPercent: row.paidPercent,
  }));
  return { years, monthsByYear };
}

function App() {
  const [tab, setTab] = useState(0);
  const [loanAmount, setLoanAmount] = useState(loanTypes[0].default);
  const [interestRate, setInterestRate] = useState(9);
  const [tenure, setTenure] = useState(20);
  const [tenureMode, setTenureMode] = useState('year');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [expandedYears, setExpandedYears] = useState([]);

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

  const { years, monthsByYear } = getAmortizationSchedule(loanAmount, interestRate, tenureMonths, startYear);

  const handleExpandYear = (year) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700, color: '#222' }}>EMI Calculator for Home Loan, Car Loan & Personal Loan in India</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
        {loanTypes.map((type, idx) => (
          <Tab key={type.label} label={type.label} />
        ))}
      </Tabs>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
        <Box sx={{ flex: 1, minWidth: 340, p: 3, background: '#f5faff', borderRadius: 2, boxShadow: 1 }}>
          <Typography gutterBottom sx={{ fontWeight: 600, color: '#222' }}>Loan Amount</Typography>
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
          <Typography gutterBottom sx={{ fontWeight: 600, color: '#222' }}>Interest Rate (%)</Typography>
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
          <Typography gutterBottom sx={{ fontWeight: 600, color: '#222' }}>Loan Tenure</Typography>
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
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#222' }}>Loan EMI</Typography>
          <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>₹ {emi.toLocaleString()}</Typography>
          <Divider sx={{ my: 2, width: '80%' }} />
          <Typography sx={{ mt: 1, fontWeight: 600, color: '#222' }}>Total Interest Payable</Typography>
          <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>₹ {totalInterest.toLocaleString()}</Typography>
          <Typography sx={{ mt: 1, fontWeight: 600, color: '#222' }}>Total Payment (Principal + Interest)</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222' }}>₹ {totalPayment.toLocaleString()}</Typography>
          <Box sx={{ mt: 3, maxWidth: 260, mx: 'auto' }}>
            <Pie data={pieData} options={{ plugins: { legend: { display: true, position: 'bottom' } } }} />
            <Typography align="center" sx={{ mt: 1, fontWeight: 600, color: '#222' }}>Break-up of Total Payment</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 5, p: 3, background: '#e3f2fd', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#222' }}>Schedule showing EMI payments starting from {startYear}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            type="number"
            label="Start Year"
            value={startYear}
            onChange={e => setStartYear(Number(e.target.value))}
            sx={{ width: 120 }}
          />
        </Box>
        <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ background: '#f5f5f5', fontWeight: 700, color: '#222' }}></TableCell>
                <TableCell sx={{ background: '#8bc34a', color: '#fff', fontWeight: 700 }}>Principal (A)</TableCell>
                <TableCell sx={{ background: '#ff9800', color: '#fff', fontWeight: 700 }}>Interest (B)</TableCell>
                <TableCell sx={{ background: '#e0e0e0', color: '#222', fontWeight: 700 }}>Total Payment (A + B)</TableCell>
                <TableCell sx={{ background: '#b71c50', color: '#fff', fontWeight: 700 }}>Balance</TableCell>
                <TableCell sx={{ background: '#e0e0e0', color: '#222', fontWeight: 700 }}>Loan Paid To Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {years.map((row) => (
                <React.Fragment key={row.year}>
                  <TableRow sx={{ background: '#fafafa' }}>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleExpandYear(row.year)}>
                        {expandedYears.includes(row.year) ? <Remove /> : <Add />}
                      </IconButton>
                      <b>{row.year}</b>
                    </TableCell>
                    <TableCell><b>₹ {row.principal.toLocaleString()}</b></TableCell>
                    <TableCell><b>₹ {row.interest.toLocaleString()}</b></TableCell>
                    <TableCell><b>₹ {row.total.toLocaleString()}</b></TableCell>
                    <TableCell><b>₹ {row.balance.toLocaleString()}</b></TableCell>
                    <TableCell><b>{row.paidPercent}%</b></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ padding: 0, border: 0 }} colSpan={6}>
                      <Collapse in={expandedYears.includes(row.year)} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ background: '#fff' }}>
                          <TableBody>
                            {monthsByYear[row.year]?.map((m, idx) => (
                              <TableRow key={m.monthName} sx={{ background: idx % 2 === 0 ? '#f9f9f9' : '#f1f1f1' }}>
                                <TableCell sx={{ pl: 6, color: '#222' }}>{m.monthName}</TableCell>
                                <TableCell sx={{ color: '#222' }}>₹ {m.principal.toLocaleString()}</TableCell>
                                <TableCell sx={{ color: '#222' }}>₹ {m.interest.toLocaleString()}</TableCell>
                                <TableCell sx={{ color: '#222' }}>₹ {m.total.toLocaleString()}</TableCell>
                                <TableCell sx={{ color: '#222' }}>₹ {m.balance.toLocaleString()}</TableCell>
                                <TableCell sx={{ color: '#222' }}>{m.paidPercent}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default App;
