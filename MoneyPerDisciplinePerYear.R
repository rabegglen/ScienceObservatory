##### Data for the animation ######

### this one is a little tricky, as an illusion of gradual increases/decreases had to be created


if(!require(pacman)){
  install.packages(
    "pacman",
    install = TRUE
  )
}


pacman :: p_load(
  tidyverse,
  rio,
  janitor,
  lubridate,
  jsonlite,
  install = TRUE
)

dir.create("./input/")
dir.create("./output/")

fileList = list.files("./input/", full.names = TRUE)

#### Importing files & processing them


pubEx = read_csv2("http://p3.snf.ch/P3Export/P3_PublicationExport.csv") %>% 
  set_names(., str_replace_all(names(.), "\\s", "_")) 



# pubEx = read_csv2("./input/P3_PublicationExport.csv") %>% 
#   set_names(., str_replace_all(names(.), "\\s", "_")) 
pubEx = pubEx %>% 
  select(Publication_ID_SNSF, Project_Number, Publication_Year, Open_Access_Status, Open_Access_Type, Authors, Title_of_Publication) %>% 
  distinct(Title_of_Publication, .keep_all = TRUE)


####### the grants ##########

### here we need 

graEx = read_csv2("http://p3.snf.ch/P3Export/P3_GrantExport.csv") %>% 
  set_names(., str_replace_all(names(.), "\\s", "_")) 

graEx = graEx %>% 
  select(-Project_Number_String, -Project_Title, -Project_Title_English, -Funding_Instrument_Hierarchy, -Keywords) %>% ## cut out some data which is not needed
  mutate(
    Approved_Amount = as.numeric(Approved_Amount), ### convert from string to number
    End_Date = dmy(End_Date), ### parse date
    Start_Date = dmy(Start_Date), ### parse another date
    Start_Year = format(Start_Date, "%Y") %>% as.numeric(), ###...and another
    End_Year =   format(End_Date, "%Y") %>% as.numeric(), ### ...and yet another
    durationYears = End_Year - Start_Year, ### we want to calculate the durations to allocate the money to each year
    durationYears = case_when(
      durationYears == 0 ~ 1, ## we treat each project with a duration of 0 years as one with 1 year, as it cannot have a duration of 0 years
      TRUE ~ durationYears
    ),
    yearlyAmount = Approved_Amount / durationYears ### get the yearly amount for each project
  )


### check for duplicates so we are not counting money twice!

graEx %>% 
  filter(duplicated(Project_Number))


#### I want to calculate the yearly money per project - I have to get durations of the projects and extend the data set this way

durations = graEx %>% 
  select(
    Project_Number, Start_Year, End_Year, durationYears
  ) %>% 
  filter(
    !is.na(Start_Year) | !is.na(End_Year)
  )

### this gives me the start and the end as well as the project number with the amount of years a project presumably took.



### WARNING: This loop will take a while

durationData = NULL
##########

### this loop will compile for each project a sequence of years the project was running

# for(i in durations$Project_Number){
#   
#   
#   print(i)
#   
#   
#   durationSlice = durations %>%  filter(
#     Project_Number == i
#   ) %>% 
#     mutate(
#       durationYears = durationYears + 1
#     )
#   
#   start = durationSlice$Start_Year
#   end = durationSlice$End_Year
#   durYr = durationSlice$durationYears
#   
#   
#   
#   
#   
#   yearSeq = seq(start, end, by = 1) %>% 
#     data.frame(duration_sequence = .)
#   
#   # print(yearSeq)
#   
#   durationYears = durationSlice$durationYears
#   durationYears = durationYears 
#   
#   # print(durationYears)
#   
#   sliceTemp = durationSlice %>%  slice(rep(1:n(), each = durationYears)) 
#   
#   if(unique(sliceTemp$Start_Year) == unique(sliceTemp$End_Year)){5
#     
#     sliceTemp = sliceTemp %>% 
#       distinct() %>% 
#       mutate(
#         durationYears = 1
#       )
#     
#   }
#   
#   sliceTemp = sliceTemp %>% 
#     data_frame(., yearSeq)
#   
#   
#   # print(sliceTemp)
#   
#   durationData = durationData %>% 
#     rbind(., sliceTemp)
#   
#   
# }



##############

#### load the existing data file, instead of doing a 20 mins loop

load("durationsData.RData")### we import it here, as it takes quite long - yes one could parallelise it, I know ;-)

durationData = durationData %>% 
  select(Project_Number, duration_sequence)### each project with the respective duration



#### join the durations with the grant data


temp = graEx %>% 
  select(Project_Number, Approved_Amount, Discipline_Name, durationYears) %>% 
  left_join(durationData, ., by = "Project_Number") %>% 
  # left_join(., OARatio, by = "Project_Number") %>%
  mutate(
    yearlyAmount = Approved_Amount / durationYears
  )




### Aggregating data


joinedDat = graEx %>% 
  left_join(., pubEx, by = "Project_Number") %>% 
  mutate(
    Project_Number = as.character(Project_Number)
  ) %>% 
  distinct() #%>% 

### the Money per discipline is not used in the viz, but I'll keep it here

disciplineMoney = joinedDat %>% 
  group_by(Discipline_Name) %>% 
  summarise(
    amountPerDisc = sum(Approved_Amount, na.rm = TRUE)
  ) %>% 
  toJSON(., pretty = TRUE) %>% 
  write(., "./oaData/DisciplineAmounts.json")





### here the real magic happens
### we want to produce an effect, to see a gradual increase. For this reason we need to split the data up into tenths of years with the money also divided by ten


disciplineYearMoney = temp %>% 
  group_by(
    Discipline_Name, duration_sequence
  ) %>% 
  summarise(
    amountPerDiscYear = sum(yearlyAmount)### get the money per discipline per year
  ) %>% 
  ungroup() %>%
  rename(
    name = Discipline_Name,
    year = duration_sequence,
    value = amountPerDiscYear### name it handily for the plot
  )  %>% 
  group_by(year) %>% 
  mutate(
    Rank = dense_rank(value),
    value = value / 10^3### get it into 1k CHF
  ) %>%  ungroup() %>% 
  arrange(name, year) %>% 
  group_by(name) %>% 
  mutate(
    lastValue = lag(value), ###as the application needs a value to reference to which was a value before the actual value, this lag has to be created
    lastValue = case_when(
      is.na(lastValue) ~ 0,###if the last value is NA, it's 0, otherwise it gets choppy
      TRUE ~ lastValue
    )
  ) %>% 
  
  
  mutate(#### simulating a linear gradient
    
    difference = value - lastValue,
    differenceTenth = difference / 10,### s
    yearTenth = 0.1
    
  ) %>%    
  group_by(name) %>%
  slice(rep(seq_len(n()), each = 10)) %>% ### stretch the data, so each tenth of a year is represented
  
  ungroup() %>% 
  group_by(name, year) %>% 
  
  mutate(
    yearTenth = cumsum(yearTenth) - yearTenth, ### cumulative sum for each tenth per year and per discipline
    differenceTenth = cumsum(differenceTenth) - differenceTenth,
    valueOld = value,
    value = differenceTenth + lastValue
    
  ) %>% 
  ungroup() %>% 
  mutate(
    year = year + yearTenth
  ) %>% 
  
  group_by(name) %>% 
  mutate(
    lastValueOld = lastValue,
    lastValue = lag(value),
    lastValue = replace_na(lastValue, 0)
  ) %>% 
  
  select(year, name, value, lastValue, Rank) %>% 


toJSON(., pretty = TRUE) %>% 
  write(., "./oaData/DisciplineAmountsPerYear.json")### parse the json and have fun
















