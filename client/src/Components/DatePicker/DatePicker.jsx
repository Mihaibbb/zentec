import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from "dayjs";
import { useCookies } from 'react-cookie';
import de from 'date-fns/locale/de';



const DateCustomInput = ({ changeDate, initialDate, future, past, label, opening, inputHidden, headerOpen, changeOpenStatus }) => {

    const [value, setValue] = useState(dayjs(new Date(initialDate).toISOString()));
    const [cookies, setCookie] = useCookies();
 
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },

      components: {
        MuiIconButton: {
          styleOverrides: {
            sizeMedium: {
              color: cookies?.theme === "light" ? "var(--text-color-3)" : "var(--text-color)"
            }
          }
        },

        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              outline: "none",
              border: `1px solid ${cookies?.theme === "light" ? "#000" : "#fff"}`
            },
          }
        },

        MuiInput: {
          styleOverrides: {
            root: {
              border: "none",
              outline: "none"
            }
          }
        },

        

        MuiFormLabel: {
          styleOverrides: {
            root: {
                opacity: "0"
            }
          }
        }
      }
    });

    const [openStatus, setOpen] = useState(opening);

    useEffect(() => {
        //if (value?.getTime() === new Date(initialDate).getTime()) return;
        const valueParsed = {...value};
        console.log(value, valueParsed, initialDate);
        if (!valueParsed?.$d) return;
          
        changeDate(valueParsed.$d);
     
    }, [value]);

    // CSS for mui calendar
    const popperSx = {


        "& .MuiPaper-root": {
            background: "var(--dark-color)",
            top: headerOpen === "desktop_active" ? '250px' : '180px',
            left: headerOpen === "desktop_active" ? `${0.175 * window.innerWidth + 32}px` : headerOpen === "desktop_inactive" ? "32px" : `${(window.innerWidth - document?.querySelectorAll(".MuiPaper-root")[0]?.clientWidth) / 2}px`,
            position: inputHidden ? 'absolute' : 'initial',
            
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
      },

  

    };
  

    return (
      <ThemeProvider theme={darkTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={de}>
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
              open={openStatus}
              onOpen={() => {
                setOpen(true);
                changeOpenStatus && changeOpenStatus(true);
              }}
              onClose={() => {
                setOpen(false);
                changeOpenStatus && changeOpenStatus(false);
              }}
              inputFormat="DD/MM/YYYY"
              label=""
              
              disableFuture={!future}
              disablePast={!past}
              openTo='day'
              views={['year', 'month', 'day']}
              value={value}
              onChange={(newValue) => {
                  setValue(newValue);
              }}
              renderInput={(params) => <TextField style={{ display: inputHidden ? "none": "block" }} {...params} />}
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