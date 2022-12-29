import * as moment from 'moment';

export class CalculatePercentage {

  colorSettings: any = {};
  kpiCalculationPeriod: string = "";
  kpiPercentage: number = 0;

  constructor(color_settings: object, kpi_calculation_period: string, kpi_percentage: number) {
    this.colorSettings = color_settings;
    this.kpiCalculationPeriod = kpi_calculation_period;
    this.kpiPercentage = kpi_percentage;
  }

  // Calculate each node percentage
  calculatePercentage(params: any, percentage: number = 0) {
    let total_percentage: number[] = [];
    // Set blank array for children, if not available
    if (!params.hasOwnProperty("children")) params.children = [];
    params?.children?.forEach((element: any) => {
      // Check if current element is a kpi node or not
      if (element.phase.name === "KPI") {
        let targetValue = 0;
        const todayDate = moment().date();
        const currentYear = moment().year();
        const dayOfYear = moment().dayOfYear();
        const daysInMonth = moment().daysInMonth();
        const daysInYear = moment([currentYear]).isLeapYear() ? 366 : 365;

        function findTarget(type: string) {
          return element.target.find((item: any) => item.frequency === type);
        }
        const checkOtherPeriods = () => {
          return (this.kpiCalculationPeriod === "month-over-month" || this.kpiCalculationPeriod === "year-over-year");
        }
        // Set target value according to monthly
        if (element.kpi_calc_period === "monthly" && !checkOtherPeriods()) {
          if (findTarget('monthly')) targetValue = findTarget('monthly').value;
          else if (findTarget('annually')) targetValue = findTarget('annually').value / 12;
          else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value / 4;
          else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 4;
          targetValue = targetValue;
        }
        // Set target value according to month to date
        else if (element.kpi_calc_period === "month-to-date" && !checkOtherPeriods()) {
          if (findTarget('monthly')) targetValue = findTarget('monthly').value;
          else if (findTarget('annually')) targetValue = findTarget('annually').value / 12;
          else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value / 4;
          else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 4;
          targetValue = todayDate * (targetValue / daysInMonth);
        }
        // Set target value according to year to date
        else if (element.kpi_calc_period === "year-to-date" && !checkOtherPeriods()) {
          if (findTarget('annually')) targetValue = findTarget('annually').value;
          else if (findTarget('monthly')) targetValue = findTarget('monthly').value * 12;
          else if (findTarget('quarterly')) targetValue = findTarget('quarterly').value * 4;
          else if (findTarget('weekly')) targetValue = findTarget('weekly').value * 52;
          targetValue = dayOfYear * (targetValue / daysInYear);
        }
        // Set percentage for month-over-month and year-over-year
        else if (this.kpiCalculationPeriod === "month-over-month" || this.kpiCalculationPeriod === "year-over-year") {
          element.percentage = this.kpiPercentage;
        }
        // Set percentage for other kpi calculation periods
        if ((element.kpi_calc_period === "monthly" || element.kpi_calc_period === "month-to-date" || element.kpi_calc_period === "year-to-date") && !checkOtherPeriods()) {
          let current_percentage= (element.achieved_value/targetValue) * 100;
          element.percentage = Math.round(current_percentage || 0);
          element.percentage = element.percentage === Infinity ? 0 : element.percentage;
        }
      } else {
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