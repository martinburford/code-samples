// Components
import Icon from "components/atoms/icon";
import Textfield from "components/atoms/textfield";

// NPM imports
import classnames from "classnames/bind";
import React from "react";
import { default as ReactMultiDatePicker, Calendar, DateObject } from "react-multi-date-picker";

// Scripts
import { buildDataAttributes } from "scripts/utilities";

// Styles
import styles from "./date-picker.module.scss";

// Types
import { EColours, ESizes } from "types/enums";
import { IDatePicker } from "./types/date-picker.types";

export const DatePicker = React.forwardRef(
  (
    {
      dataAttributes = {},
      disabled,
      hasError = false,
      inputSize = 13,
      label,
      maxDate,
      minDate,
      numberOfMonths = 1,
      onChange,
      placeholder = "Please select",
      required,
      theme = "deals-plus",
      type,
      value,
      weekendsDisabled = true,
    }: IDatePicker,
    ref: React.MutableRefObject<any>
  ) => {
    // Bind classnames to the components CSS module object in order to access its modular styles
    const cx = classnames.bind(styles);
    const classes = cx({
      "date-picker": true,
      disabled,
      "has-error": hasError,
      "multi-months": numberOfMonths === 2,
      required,
      "weekends-disabled": weekendsDisabled || disabled,
    });

    const options = {
      className: `datepicker-${theme}`,
      disabled,
      format: "DD/MM/YYYY",
      mapDays: ({ date }) => {
        let isWeekend = [0, 6].includes(date.weekDay.index);

        if (isWeekend)
          return {
            disabled: weekendsDisabled,
          };
      },
      maxDate,
      minDate,
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      multiple: numberOfMonths > 1,
      numberOfMonths,
      onChange: (dates: DateObject | DateObject[]) => {
        if (onChange) {
          onChange(dates);
        }
      },
      onOpenPickNewDate: false,
      range: numberOfMonths > 1,
      rangeHover: numberOfMonths > 1,
      value: value ? value : null,
      weekStartDayIndex: 1, // Monday
    };
    
    // Which type should be shown?
    let componentElem = null;
    switch (type) {
      case "calendar":
        componentElem = <Calendar {...options} />;
        break;

      case "datepicker":
        
        let testData = value;
        if(value){
          const [day, month, year] = value ? value.toString().split("/") : null;
          testData = `${day}/${month}`;
        }
        
        componentElem = (
          <ReactMultiDatePicker
            {...options}
            render={(value, openCalendar, handleValueChange) => {
              return (
                <Textfield
                  controlled={true}
                  disabled={disabled}
                  maxLength={type === "datepicker" && numberOfMonths === 1 ? 10 : -1}
                  name="datepicker"
                  onChange={handleValueChange}
                  onFocus={openCalendar}
                  placeholder={placeholder}
                  readonly={type === "datepicker"}
                  ref={ref}
                  size={inputSize}
                  suffix={
                    <>
                      <Icon colour={EColours.GRAY} id="calendar" onClick={openCalendar} size={ESizes.S} />
                    </>
                  }
                  value={numberOfMonths === 1 ? value : value}
                />
              );
            }}
          />
        );
        break;
    }

    // Is a label required?
    const labelElem = label ? (
      <div className={styles["label-outer"]}>
        <label className={styles.label}>{label}</label>
      </div>
    ) : null;

    return (
      <div className={classes} {...buildDataAttributes("date-picker", dataAttributes)} data-type={type}>
        {labelElem}
        {componentElem}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
