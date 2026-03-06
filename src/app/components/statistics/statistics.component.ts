import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartLabels: string[] = ['2022', '2023', '2024'];
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: this.barChartLabels,
    datasets: [
      { data: [65, 59, 80], label: 'Series A', backgroundColor: 'red' },
      { data: [28, 48, 40], label: 'Series B', backgroundColor:'blue' }
    ]
  };

  chart:any;
  public config: any = {
    type: 'bar',
    data: this.barChartData
  }

  ngOnInit(): void {
    this.chart = new Chart('MyChart', this.config);
  }
}
