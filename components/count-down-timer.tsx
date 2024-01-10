import { useCountdown } from "@/hook/count-down";
import { Progress } from "@nextui-org/react";
import { className } from "postcss-selector-parser";

interface ShowCounterProps {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  isSimple?: boolean;
  className?: string;
}

const ShowCounter = ({days, hours, minutes, seconds, isSimple}: ShowCounterProps) => {
  const displayDays = (value: number | undefined): boolean => {
    if (value === undefined || value === null) return false;
    return value > 0;
  }

  const displayHours = (dayValue: number | undefined, hourValue: number | undefined): boolean => {
    if (hourValue === undefined || hourValue === null) return false;
    if (dayValue === undefined || dayValue === null) return false;
    return dayValue > 0 || hourValue > 0;
  }

  const displayMinutes = (dayValue: number | undefined, hourValue: number | undefined, minuteValue: number | undefined): boolean => {
    if (minuteValue === undefined || minuteValue === null) return false;
    if (hourValue === undefined || hourValue === null) return false;
    if (dayValue === undefined || dayValue === null) return false;
    return dayValue > 0 || hourValue > 0 || minuteValue > 0;
  }

  const displaySeconds = (dayValue: number | undefined, hourValue: number | undefined, minuteValue: number | undefined, secondValue: number | undefined): boolean => {
    if (secondValue === undefined || secondValue === null) return false;
    if (minuteValue === undefined || minuteValue === null) return false;
    if (hourValue === undefined || hourValue === null) return false;
    if (dayValue === undefined || dayValue === null) return false;
    return dayValue > 0 || hourValue > 0 || minuteValue > 0 || secondValue > 0;
  }

  if (isSimple) {
    const getPlainTimeLeftString = (days: number | undefined, hours: number | undefined, minutes: number | undefined, seconds: number | undefined): string => {
      let res = ""
      if (displayDays(days)) {
        res += `${days}d:`
      }
      if (displayHours(days, hours)) {
        res += `${hours}h:`
      }
      if (displayMinutes(days, hours, minutes)) {
        res += `${minutes}m:`
      }
      if (displaySeconds(days, hours, minutes, seconds)) {
        res += `${seconds}s`
      }
      return res
    }
    return (
      <p>{getPlainTimeLeftString(days, hours, minutes, seconds)}</p>
    )
  }

  return (
    <div className="flex flex-row gap-1 sm:gap-2 font-mono items-end">
      {displayDays(days) &&
        <div className="flex flex-row items-start gap-1 sm:gap-2">
          <DateTimeDisplay value={days} type={'Day'} isDanger={false}/>
          <p className="text-lg">:</p>
        </div>}
      {displayHours(days, hours) && <div className="flex flex-row items-start gap-1 sm:gap-2">
        <DateTimeDisplay value={hours} type={'Hour'} isDanger={false}/>
        <p className="text-lg">:</p>

      </div>}

      {displayMinutes(days, hours, minutes) && <div className="flex flex-row items-start gap-1 sm:gap-2">
        <DateTimeDisplay value={minutes} type={'Min'} isDanger={false}/>
        <p className="text-lg">:</p>

      </div>}

      {displaySeconds(days, hours, minutes, seconds) &&
        <DateTimeDisplay value={seconds} type={'Sec'} isDanger={false}/>}
    </div>
  );
};

interface DateTimeDisplayProps {
  value?: number;
  type: string;
  isDanger: boolean;
}

const DateTimeDisplay = ({value, type, isDanger}: DateTimeDisplayProps) => {
  const dangerClass = isDanger ? "accent-danger" : "";
  return (
    <div className="flex flex-col items-center">
      <p className={`${dangerClass} text-lg`}>{value}</p>
      <p className={`${dangerClass} text-[11px]`}>{type}</p>
    </div>
  );
};

interface CountdownTimerProps {
  targetDate: number;
  progress?: number;
  text?: string;
}

const CountdownTimer = ({targetDate, progress, text}: CountdownTimerProps) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  if (days + hours + minutes + seconds <= 0) {
    return <>
      <Progress
        color={"success"}
        value={100}
        isStriped={true}
        label={<>Mint Time is up.</>}
        classNames={{
          label: "tracking-wider font-medium text-default-600/60",
          value: "text-foreground/60",
        }}
      />
    </>;
  } else {
    return (
      <Progress
        color={"secondary"}
        value={progress}
        isStriped={true}
        label={
        <div className="flex flex-col justify-between min-w-full items-center">
          <p className="mt-4 mb-2 font-bold">{text ? text : "Mint Time Left:"}</p>
          <ShowCounter
            days={days}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
          />
        </div>

        }
        classNames={{
          label: "!min-w-full",
          value: "text-foreground/60",
        }}
      />

    );
  }
};

export default CountdownTimer;

interface SimpleTimerProps {
  targetDate: number;
}

export const SimpleTimer = ({targetDate}: SimpleTimerProps) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);
  if (days + hours + minutes + seconds <= 0) {
    return <></>
  } else {
    return <ShowCounter days={days} hours={hours} minutes={minutes} seconds={seconds} isSimple={true}/>
  }
}