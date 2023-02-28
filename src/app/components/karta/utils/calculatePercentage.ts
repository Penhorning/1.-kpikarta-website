import * as moment from 'moment';

export class CalculatePercentage {

  colorSettings: any = {};
  kpiCalculationPeriod: any = {
    frequency: "",
    nodeId: ""
  }
  kpiPercentage: number = 0;
  filterTargetBy: string = "";

  constructor(color_settings: object, kpi_calculation_period: object, kpi_percentage: number, filterTargetBy: string = "") {
    this.colorSettings = color_settings;
    this.kpiCalculationPeriod = kpi_calculation_period;
    this.kpiPercentage = kpi_percentage;
    this.filterTargetBy = filterTargetBy;
  }

  // Get number of days
  getNumberOfDays(isBusiness: boolean = true, type: any = 'month', date?: { type: string, start?: any, end?: any }, ) {
    let startDate = moment().startOf(type).format('YYYY-MM-DD hh:mm');
    let endDate = moment().endOf(type).format('YYYY-MM-DD hh:mm');
    // Get days till today
    if (date && date.type === "start") startDate = moment(date.start).format('YYYY-MM-DD hh:mm');
    else if (date && date.type === "end") endDate = moment(date.end).format('YYYY-MM-DD hh:mm');
    else if (date && date.type === "both") {
      startDate = moment(date.start).format('YYYY-MM-DD hh:mm');
      endDate = moment(date.end).format('YYYY-MM-DD hh:mm');
    }
    let day = moment(startDate);
    let businessDays = 0;
    
    // Get business days
    if (isBusiness) {
      while (day.isSameOrBefore(endDate,'day')) {
        if (day.day()!=0 && day.day()!=6) businessDays++;
          day.add(1,'d');
      }
    }
    // Get all days
    else {
      while (day.isSameOrBefore(endDate,'day')) {
        businessDays++;
        day.add(1,'d');
      }
    }
    return businessDays;
  }

  // Calculate each node percentage
  calculatePercentage(params: any, percentage: number = 0) {
    let total_percentage: number[] = [];
    const children = (params.children || params._children || []);
    
    children.forEach(async (element: any) => {
      // Calculate percentage for KPI nodes only
      if (element.phase.global_name === "KPI") {
        let targetValue = 0;
        const dayOfMonth = moment().date();
        const businessDayOfMonth = this.getNumberOfDays(true, 'month', { type: "end", end: moment() });
        const currentYear = moment().year();
        const dayOfYear = moment().dayOfYear();
        const businessDayOfYear = this.getNumberOfDays(true, 'year', { type: "end", end: moment() });
        const daysInMonth = moment().daysInMonth();
        const businessDaysInMonth = this.getNumberOfDays(true, 'month');
        const daysInYear = moment([currentYear]).isLeapYear() ? 366 : 365;
        const businessDaysInYear = this.getNumberOfDays(true, 'year');

        const calculateTargetValue = (targetValue: any, durationType: string, f_startDate: any, f_endDate: any, daysToCalc: string) => {
          const currentMonthNumber = new Date().getMonth();
          const startMonthNumber = new Date(f_startDate).getMonth();
          const endMonthNumber = new Date(f_endDate).getMonth();

          const getTargetValue = (isBusiness: boolean) => {
            // Check if today's date greater than fiscal year start date or end date
            if (moment(f_startDate).date() <= moment().date()) {
              let fiscalDayOfMonth = this.getNumberOfDays(isBusiness, durationType, { type: "both", start: moment(f_startDate), end: moment() });
              let fiscalDaysInMonth = this.getNumberOfDays(isBusiness, durationType, { type: "start", start: moment(f_startDate) });
              return fiscalDayOfMonth * (targetValue / fiscalDaysInMonth);
            } else {
              let fiscalDayOfMonth = this.getNumberOfDays(isBusiness, durationType, { type: "both", start: moment(), end: moment(f_endDate) });
              let fiscalDaysInMonth = this.getNumberOfDays(isBusiness, durationType, { type: "end", end: moment(f_endDate) });
              return fiscalDayOfMonth * (targetValue / fiscalDaysInMonth);
            }
          }
          
          // Check if => Fiscal Year start date = date, Fiscal Year end date = date, Days to calculate = business
          if (f_startDate && f_endDate && daysToCalc === "business") {
            if (currentMonthNumber === startMonthNumber || currentMonthNumber === endMonthNumber) {
              return getTargetValue(true);
            } else return businessDayOfMonth * (targetValue / businessDaysInMonth);
          }
          // Check if => Fiscal Year start date = date, Fiscal Year end date = date, Days to calculate = all
          else if (f_startDate && f_endDate && daysToCalc !== "business") {
            if (currentMonthNumber === startMonthNumber || currentMonthNumber === endMonthNumber) {
              return getTargetValue(false);
            } else return dayOfMonth * (targetValue / daysInMonth);
          }
          // Check if => Fiscal Year start date = null, Fiscal Year end date = null, Days to calculate = business
          else if (!f_startDate && !f_endDate && daysToCalc === "business") {
            return businessDayOfMonth * (targetValue / businessDaysInMonth);
          }
          // Check if => Fiscal Year start date = null, Fiscal Year end date = null, Days to calculate = all
          else return dayOfMonth * (targetValue / daysInMonth);
        }
        const findTarget = (type: string) => {
          return element.target.find((item: any) => item.frequency === type);
        }
        const findAppropirateTarget = (targetType: string) => {
          switch (targetType) {
            case "weekly":
              if (findTarget('weekly')) targetValue = findTarget('weekly').value;
              else if (findTarget('monthly')) targetValue = findTarget('monthly').value / 4;
              else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value / 12;
              else if (findTarget('yearly')) targetValue = findTarget('yearly').value / 52;
              break;
            case "quarterly":
              if (findTarget('quarterly')) targetValue = findTarget('quarterly').value;
              else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 12;
              else if (findTarget('monthly')) targetValue = findTarget('monthly').value * 3;
              else if (findTarget('yearly')) targetValue = findTarget('yearly').value / 4;
              break;
            case "monthly":
              if (findTarget('monthly')) targetValue = findTarget('monthly').value;
              else if (findTarget('yearly')) targetValue = findTarget('yearly').value / 12;
              else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value / 4;
              else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 4;
              break;
            case "yearly":
              if (findTarget('yearly')) targetValue = findTarget('yearly').value;
              else if (findTarget('monthly')) targetValue = findTarget('monthly').value * 12;
              else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value * 4;
              else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 52;
              break;
          }
          return targetValue;
        }
        const checkOtherPeriods = () => {
          return (this.kpiCalculationPeriod.frequency === "month-over-month" || this.kpiCalculationPeriod.frequency === "year-over-year") && (element.id === this.kpiCalculationPeriod.nodeId)
        }
        // Set target value according to monthly
        if (element.kpi_calc_period === "monthly" && !checkOtherPeriods()) {
          if (this.filterTargetBy) targetValue = findAppropirateTarget(this.filterTargetBy);
          else {
            if (findTarget('monthly')) targetValue = findTarget('monthly').value;
            else if (findTarget('yearly')) targetValue = findTarget('yearly').value / 12;
            else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value / 4;
            else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 4;
          }
        }
        // Set target value according to month to date
        else if (element.kpi_calc_period === "month-to-date" && !checkOtherPeriods()) {
          if (this.filterTargetBy) targetValue = findAppropirateTarget(this.filterTargetBy);
          else {
            // Find target value
            if (findTarget('monthly')) targetValue = findTarget('monthly').value;
            else if (findTarget('yearly')) targetValue = findTarget('yearly').value / 12;
            else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value / 4;
            else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 4;
            // Set target value
            targetValue = calculateTargetValue(targetValue, 'month', element.fiscal_year_start_date, element.fiscal_year_end_date, element.days_to_calculate)!; 
          }
        }
        // Set target value according to year to date
        else if (element.kpi_calc_period === "year-to-date" && !checkOtherPeriods()) {
          if (this.filterTargetBy) targetValue = findAppropirateTarget(this.filterTargetBy);
          else {
            // Find target value
            if (findTarget('yearly')) targetValue = findTarget('yearly').value;
            else if (findTarget('monthly')) targetValue = findTarget('monthly').value * 12;
            else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value * 4;
            else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 52;
            // Set target value
            targetValue = calculateTargetValue(targetValue, 'year', element.fiscal_year_start_date, element.fiscal_year_end_date, element.days_to_calculate)!;
          }
        }
        // Set percentage for month-over-month and year-over-year
        else if ((this.kpiCalculationPeriod.frequency === "month-over-month" || this.kpiCalculationPeriod.frequency === "year-over-year") && (element.id === this.kpiCalculationPeriod.nodeId)) {
          element.percentage = this.kpiPercentage;
        }
        // Set percentage for other kpi calculation periods
        if ((element.kpi_calc_period === "monthly" || element.kpi_calc_period === "month-to-date" || element.kpi_calc_period === "year-to-date") && !checkOtherPeriods()) {
          let current_percentage= (element.achieved_value/targetValue) * 100;
          element.percentage = Math.round(current_percentage || 0);
          element.percentage = element.percentage === Infinity ? 0 : element.percentage;
        }
      }
      // Calculate percentage for NON-KPI nodes
      else {
        let returned_percentage = this.calculatePercentage(element, percentage);
        element.percentage = Math.round(returned_percentage || 0);
        element.percentage = element.percentage === Infinity ? 0 : Math.round(returned_percentage);
      }
      // Set border color for each node according to percentage
      if (element.percentage > 100) {
        let colorSetting = this.colorSettings.settings.filter((item: any) => item.min === 101 && item.max === 101);
        element.border_color = colorSetting[0]?.color || 'black';
      } else if (this.colorSettings.settings) {
        let colorSetting = this.colorSettings.settings.filter((item: any) => element.percentage >= item.min && element.percentage <= item.max);
        element.border_color = colorSetting[0]?.color || 'black';
      } else element.border_color = 'black';
      total_percentage.push(((element.percentage * element.weightage) / 100) || 0);
    });
    let aggregate_percentage = total_percentage.reduce((acc: number, num: number) => acc + num, 0);
    return aggregate_percentage;
  }
}