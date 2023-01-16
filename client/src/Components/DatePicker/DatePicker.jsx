import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const DateCustomInput = ({ changeDate, initialDate, future, past, label }) => {

    const [value, setValue] = useState(initialDate);
    const [cookies, setCookie] = useState();
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    useEffect(() => {
        const valueParsed = {...value};
        changeDate(valueParsed.$d);
        console.log(valueParsed);
    }, [value]);

    // CSS for mui calendar
    const popperSx = {
        "& .MuiPaper-root": {
            background: "var(--dark-color)"
        },

        "& button.PrivatePickersYear-yearButton,  button.PrivatePickersMonth-root,  button.MuiPickersDay-root": {
          background: "var(--over-difference-color)"
        },

        "& button.PrivatePickersYear-yearButton.Mui-selected,  button.PrivatePickersMonth-root.Mui-selected,  button.MuiPickersDay-root.Mui-selected": {
          backgroundColor: "var(--contrast-color)",
          color: "#fff",
          transition: "all 300ms ease-in-out"
        },

        "& button.PrivatePickersYear-yearButton.Mui-selected:hover,  button.PrivatePickersMonth-root.Mui-selected:hover,  button.MuiPickersDay-root.Mui-selected:hover": {
          backgroundColor: "var(--contrast-color-highlight)",
      
        },
    };

    const inputSx = {
      ".MuiInputBase-input": {
        padding: "0 0 0 1rem",
        maxWidth: '260px'
      }
    };
  

    return (
      <ThemeProvider theme={darkTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* <MobileDatePicker
            label="For mobile"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
            
            renderInput={(params) => <TextField {...params} />}
          />
          <DesktopDatePicker
            label="For desktop"
            value={value}
            minDate={dayjs('2017-01-01')}
            onChange={(newValue) => {
              setValue(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
          /> */}
        
          <DatePicker
              inputFormat="DD/MM/YYYY"
              label={label}
              disableFuture={!future}
              disablePast={!past}
              openTo="year"
              views={['year', 'month', 'day']}
              value={value}
              onChange={(newValue) => {
                  setValue(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
              PopperProps={{
                sx: popperSx
              }}
              InputProps={{
                sx: inputSx
              }}
              
          />
      </LocalizationProvider>
    </ThemeProvider>
    );
};

export default DateCustomInput;