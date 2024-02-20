'use client'

import { createChart, ColorType, PriceScaleMode } from 'lightweight-charts';
import React, { useEffect, useMemo, useRef, useState } from 'react';


export const ChartComponent = (props: any) => {
  const {
    data,
    tokenName,
    colors: {
      backgroundColor = 'transparent',
      lineColor = '#2962FF',
      textColor = 'white',
      areaTopColor = '#2962FF',
      areaBottomColor = 'rgba(41, 98, 255, 0.28)',
    } = {},
  } = props;


  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPrice, setSelectedPrice] = useState('');
  const legend = useMemo(() => {
    return `${tokenName}/ETH ${selectedPrice}`
  }, [tokenName, selectedPrice]);

  useEffect(
    () => {
      if (!chartContainerRef.current) {
        return;
      }

      const handleResize = () => {
        if (!chartContainerRef.current) {
          return;
        }
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };


      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: backgroundColor },
          textColor,
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });
      chart.timeScale().applyOptions({
        timeVisible: true,
      })
      chart.timeScale().fitContent();


      const newSeries = chart.addAreaSeries(
        {
          lineColor,
          topColor: areaTopColor,
          bottomColor: areaBottomColor ,
          priceFormat: {
            minMove: 0.00001,
          }
        }
      );
      newSeries.priceScale().applyOptions({
        mode: PriceScaleMode.Logarithmic,

      })
      newSeries.setData(data);

      chart.subscribeCrosshairMove((param) => {
        if (param.time) {
          const data = param.seriesData.get(newSeries);
          // @ts-ignore
          if (data && data.value) {
            // @ts-ignore
            setSelectedPrice(data.value.toString());
          }
        } else {
          setSelectedPrice('');
        }
      })

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);

        chart.remove();
      };
    },
    [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
  );

  return (
    <div>
      <div className="ml-2 mb-2 font-mono text-default-500 text-sm">{legend}</div>
      <div
        ref={chartContainerRef}
      />
    </div>
  );
};
