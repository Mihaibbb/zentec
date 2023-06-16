import React, { useState } from "react";
import {
  Stack,
  OutlinedInput,
  InputLabel,
  MenuItem,
  Chip,
  Select,
  FormControl,
  Autocomplete,
  TextField
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useCookies } from "react-cookie";
import { ThemeProvider, createTheme } from '@mui/material/styles';


const MultiSelect = ({ options, colors, label, handleChanges, defaultValue, width }) => {

    const [cookies, setCookie] = useCookies();
    const [defaultValueState, setDefaultValueState] = useState(defaultValue);
    let idx = -1;
    return (
            <Autocomplete
                sx={{ 
                    m: 1, 
                    width: width || 500,
                    '& .MuiButtonBase-root': {
                        backgroundColor: "var(--over-difference-color)",
                        color: "var(--text-color-2)"
                    },

                    "& .MuiInputBase-input": {
                        color: "var(--text-color-2)"
                    },
                    
                    "& .MuiAutocomplete-popper": {
                        backgroundColor: "var(--over-difference-color-2)",
                        color: "var(--text-color-2)"
                    }
                }}
                multiple
                id="tags-standard"
                options={options}
                getOptionLabel={(option) => option}
                defaultValue={defaultValueState || []}
                disableCloseOnSelect
                onChange={(e, values) => handleChanges(values)}
                renderOption={(props, option, { selected }) => {
                    idx++;
                    return (
                        <MenuItem
                            key={option}
                            value={option}
                            sx={{ 
                                justifyContent: "space-between", 
                                
                            }}
                            {...props}
                        >
                            {colors && colors.length && colors?.[idx] ? <div style={{ width: 25, height: 25, borderRadius: "50%", backgroundColor: colors[idx]}}></div> : null }
                            {option}
                            {selected ? <CheckIcon color="info" /> : null}
                        </MenuItem>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        label={label}
                        placeholder={cookies?.language === "en" ? "Options..." : "Optiuni..."}
                    />
                )}
            />
        
    );
};

export default MultiSelect;