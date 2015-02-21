package de.frosner.dds.chart

import de.frosner.dds.chart.ChartTypeEnum.ChartType
import spray.json.{JsNumber, JsString, JsArray, JsObject}

case class SeriesData[N](series: Iterable[Series[N]], types: ChartTypes) extends Data {

  override def toJson: JsObject = {
    JsObject(
      ("columns", JsArray(series.map(_.toJson).toVector)),
      ("types", types.toJsonWithLabels(series.map(_.label)))
    )
  }

}

object SeriesData {
  def apply[N](series: Series[N], chartType: ChartType) = new SeriesData(List(series), ChartTypes(List(chartType)))
}

