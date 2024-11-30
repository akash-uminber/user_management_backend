const { User } = require('../models/userModel');
const CurrentWorkInfo = require('../models/currentWorkInfoModel');

// Helper function to get month name
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

// Helper function to get current date in local timezone
const getCurrentDate = () => {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const offset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const localDate = new Date(now.getTime() + offset);
  return {
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth() + 1,
    date: localDate.getUTCDate()
  };
};

// Helper function to format the response
const formatEmployeeData = (employees) => {
  return employees.map(emp => ({
    userId: emp.userId?._id,
    email: emp.userId?.email,
    employeeId: emp.employeeId,
    designation: emp.designation,
    department: emp.department,
    status: emp.status,
    startDate: emp.startDate,
    endDate: emp.endDate,
    updatedAt: emp.updatedAt
  }));
};

exports.getCurrentMonthReport = async (req, res) => {
  try {
    // Get current date in local timezone
    const { year, month } = getCurrentDate();
    console.log('Local Date Info:', { year, month });

    // Calculate start and end dates for the current month
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    console.log('Query Date Range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Get employees active in the current month
    const employees = await CurrentWorkInfo.find({
      startDate: { $lte: endDate } // Started before or during this month
    }).populate('userId', 'email');

    console.log('All employees found:', employees.length);

    // Filter employees who were active in the current month
    const activeEmployees = employees.filter(emp => {
      const employeeStartDate = new Date(emp.startDate);
      console.log('Employee:', {
        email: emp.userId?.email,
        startDate: employeeStartDate.toISOString(),
        status: emp.status
      });
      
      // Check if employee started before or during the current month
      return employeeStartDate <= endDate;
    });

    console.log('Active employees in period:', activeEmployees.length);

    // Categorize employees by their current status
    const report = {
      hired: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'active')),
      terminated: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'terminated')),
      resigned: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'resigned')),
      suspended: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'suspended'))
    };

    // Add summary with correct current date
    const summary = {
      totalHired: report.hired.length,
      totalTerminated: report.terminated.length,
      totalResigned: report.resigned.length,
      totalSuspended: report.suspended.length,
      month: getMonthName(month),
      year: year,
      totalEmployees: activeEmployees.length
    };

    console.log('Generated Summary:', summary);

    res.status(200).json({
      success: true,
      summary,
      report
    });

  } catch (error) {
    console.error('Error in getCurrentMonthReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating current month status report',
      error: error.message
    });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = getCurrentDate();
    const { year: queryYear = year, month: queryMonth = month } = req.query;
    
    // Validate input
    const parsedYear = parseInt(queryYear);
    const parsedMonth = parseInt(queryMonth);

    if (parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Month should be between 1 and 12'
      });
    }

    // Calculate start and end dates for the requested month
    const startDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1));
    const endDate = new Date(Date.UTC(parsedYear, parsedMonth, 0));

    console.log('Query Date Range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Get employees active in the specified month
    const employees = await CurrentWorkInfo.find({
      startDate: { $lte: endDate } // Started before or during this month
    }).populate('userId', 'email');

    console.log('All employees found:', employees.length);

    // Filter employees who were active in the requested month
    const activeEmployees = employees.filter(emp => {
      const employeeStartDate = new Date(emp.startDate);
      console.log('Employee:', {
        email: emp.userId?.email,
        startDate: employeeStartDate.toISOString(),
        status: emp.status
      });
      
      // Check if employee started before or during the requested month
      return employeeStartDate <= endDate;
    });

    console.log('Active employees in period:', activeEmployees.length);

    // Categorize employees by their status
    const report = {
      hired: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'active')),
      terminated: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'terminated')),
      resigned: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'resigned')),
      suspended: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'suspended'))
    };

    // Add summary
    const summary = {
      totalHired: report.hired.length,
      totalTerminated: report.terminated.length,
      totalResigned: report.resigned.length,
      totalSuspended: report.suspended.length,
      month: getMonthName(parsedMonth),
      year: parsedYear,
      totalEmployees: activeEmployees.length
    };

    res.status(200).json({
      success: true,
      summary,
      report
    });

  } catch (error) {
    console.error('Error in getMonthlyReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating monthly status report',
      error: error.message
    });
  }
};

exports.getYearlyReport = async (req, res) => {
  try {
    const { year: currentYear } = getCurrentDate();
    const { year = currentYear } = req.query;
    const parsedYear = parseInt(year);

    // Calculate start and end dates for the requested year
    const startDate = new Date(Date.UTC(parsedYear, 0, 1));
    const endDate = new Date(Date.UTC(parsedYear, 11, 31));

    console.log('Query Date Range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Get employees active in the specified year
    const employees = await CurrentWorkInfo.find({
      startDate: { $lte: endDate } // Started before or during this year
    }).populate('userId', 'email');

    console.log('All employees found:', employees.length);

    // Filter employees who were active in the requested year
    const activeEmployees = employees.filter(emp => {
      const employeeStartDate = new Date(emp.startDate);
      console.log('Employee:', {
        email: emp.userId?.email,
        startDate: employeeStartDate.toISOString(),
        status: emp.status
      });
      
      // Check if employee started before or during the requested year
      return employeeStartDate <= endDate;
    });

    console.log('Active employees in period:', activeEmployees.length);

    // Categorize employees by their current status
    const baseReport = {
      hired: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'active')),
      terminated: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'terminated')),
      resigned: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'resigned')),
      suspended: formatEmployeeData(activeEmployees.filter(emp => emp.status === 'suspended'))
    };

    // Initialize monthly data with the same categorization for each month
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: getMonthName(i + 1),
      ...baseReport,
      summary: {
        totalHired: baseReport.hired.length,
        totalTerminated: baseReport.terminated.length,
        totalResigned: baseReport.resigned.length,
        totalSuspended: baseReport.suspended.length
      }
    }));

    // Calculate yearly totals
    const yearlyTotals = {
      totalHired: baseReport.hired.length,
      totalTerminated: baseReport.terminated.length,
      totalResigned: baseReport.resigned.length,
      totalSuspended: baseReport.suspended.length,
      year: parsedYear,
      totalEmployees: activeEmployees.length
    };

    res.status(200).json({
      success: true,
      yearlyTotals,
      monthlyData
    });

  } catch (error) {
    console.error('Error in getYearlyReport:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating yearly status report',
      error: error.message
    });
  }
};
