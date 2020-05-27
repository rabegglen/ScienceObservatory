#### get publication data to projects by publication year

if(!require(pacman)){
  install.packages("pacman")
}



pacman :: p_load(
  tidyverse,
  rio,
  janitor,
  lubridate,
  data.table,
  pipeR,
  jsonlite,
  parallel,
  install = TRUE
)




dir.create("./oaData/")

fileList = list.files("./input/", full.names = TRUE)





# pubEx = read_csv2("http://p3.snf.ch/P3Export/P3_PublicationExport.csv") %>% 
#   set_names(., str_replace_all(names(.), "\\s", "_")) 


### Import the data

pubEx = read_csv2("./input/P3_PublicationExport.csv") %>% 
  set_names(., str_replace_all(names(.), "\\s", "_")) ### get the whitespaces out of the names
pubEx = pubEx %>% 
  select(Publication_ID_SNSF, Project_Number, Publication_Year, Open_Access_Status, Open_Access_Type, Authors, Title_of_Publication, Publication_Year) %>% ## select meaningful attributes
  distinct(Title_of_Publication, .keep_all = TRUE) ## remove duplicates in the titles, which is probably the safest bet



#### OA ratios of publications per project

#### here the ratio of OA to CA is calculated - it will not be used in the d3 app, but is still here as it's actually useful


OARatio = pubEx %>%
  select(Project_Number, Open_Access_Status, Publication_Year) %>% ### select meaningful attributes for data processing
  filter(grepl("[0-9]{1, }", Project_Number) & grepl("0|1", Open_Access_Status)) %>% #### get only entries with actual content in the project number and OA status attributes
  mutate(Project_Number = as.numeric(Project_Number),
         openAcc = case_when(
           Open_Access_Status == 1 ~ 1,
           TRUE ~ 0### introduce dummy coding to get the ratios easily - this helps to calculate each ratios or sums
           
         ),
         
         closAcc = case_when(
           Open_Access_Status == 0 ~ 1,
           TRUE ~ 0
         )
         
  ) %>%
  group_by(
    Project_Number, Publication_Year
  ) %>%
  
  summarise(
    sumclosAcc = sum(closAcc, na.rm = TRUE),
    sumopenAcc = sum(openAcc, na.rm = TRUE)### doing a grouped sum by project number and year, so we have the sum of all CA and OA publications per project and year
  ) %>%
  
  ungroup() 






### alternatively, directly from the web

# pubEx = read_csv2("http://p3.snf.ch/P3Export/P3_GrantExport.csv") %>% 
#   set_names(., str_replace_all(names(.), "\\s", "_")) 


Projects = read.csv2("./input/P3_GrantExport.csv") %>% ### importing the data
  set_names(., str_replace_all(names(.), "\\.", "_"))

Proj = Projects %>% 
  tibble() %>% 
  ### selecting all needed attributes
  select(Project_Number, University, Discipline_Name, Discipline_Name_Hierarchy) %>% 
  ### The join with the publication summary is important to get the disciplines stored in the data set for the projects to then use it in the visualisation
  left_join(OARatio, ., by = "Project_Number") %>% 
  select(-Project_Number) %>% ### get rid of the project number as we want to summarise by year and we have the info from the disciplines via the join
  filter(!is.na(Discipline_Name_Hierarchy) | grepl("[a-z]{4, }", Discipline_Name_Hierarchy, ignore.case = TRUE)) %>% ## filter only etnries with actual values
  filter(Publication_Year <= 2020) %>% ### only from 2020 and lower to capture recent projects
  mutate(
    Discipline_Name_Hierarchy = case_when(### get Interdisciplinary as Hierarchy instead
      grepl("interdisciplinary", Discipline_Name, ignore.case = TRUE) ~ "Interdisciplinary",
      TRUE ~ Discipline_Name_Hierarchy
    
    ),
    Discipline_Name_Hierarchy = str_remove(Discipline_Name_Hierarchy, "(?=;).+") ###¶ the first word of the Hierarchy until the semicolon appears is the highest order of the hierarchy and the target here
  ) %>% 
  group_by(Publication_Year, Discipline_Name_Hierarchy) %>% ### grouping for summarisation
  summarise(
    sumOA = sum(sumopenAcc),### summarisea all OA and CA publications
    sumCA = sum(sumclosAcc)
  ) %>% 
  ungroup() %>% 
  filter(
    Discipline_Name_Hierarchy != ""### no empty strings please!
  )

  

Proj %>% 
  toJSON(.) %>% 
  write(., "oaData/PublicationStatusYearDisciplineHierarchy.json")### parse the data to json - yay! This is for figure 3


### this block just summarises up the publications per year, visible in figure 2

Pubs = Projects %>% 
  tibble() %>% 
  select(Project_Number, University, Discipline_Name, Discipline_Name_Hierarchy) %>% 
  left_join(OARatio, ., by = "Project_Number") %>% 
  distinct() %>% 
  select(-Project_Number) %>% 
  filter(!is.na(Discipline_Name_Hierarchy) | grepl("[a-z]{4, }", Discipline_Name_Hierarchy, ignore.case = TRUE)) %>% 
  filter(Publication_Year <= 2020) %>% 
  mutate(
    Discipline_Name_Hierarchy = case_when(
      grepl("interdisciplinary", Discipline_Name, ignore.case = TRUE) ~ "Interdisciplinary",
      TRUE ~ Discipline_Name_Hierarchy
    )
  ) %>% 
  group_by(Publication_Year) %>% 
  summarise(
    sumOA = sum(sumopenAcc),
    sumCA = sum(sumclosAcc)
  ) %>% 
  ungroup()


Pubs %>% 
  toJSON(.) %>% 
  write(., "oaData/PublicationsPerYear.json")







######### OA types per year - This is not in the viz, however I'll keep it here


pubEx %>% 
  filter(!is.na(Publication_Year)) %>% 
  distinct(Title_of_Publication, .keep_all = TRUE) %>% 
  select(Publication_Year, Open_Access_Status, Open_Access_Type) %>% 
  filter(
    !is.na(Open_Access_Status) & Publication_Year <= 2020
  ) %>% 
  mutate(
    Open_Access_Type = case_when(
      Open_Access_Status == 0 ~ "No Open Access",
      is.na(Open_Access_Type) ~ "Unknown Type",
      TRUE ~ Open_Access_Type
    ),
    
    Open_Access_Status = case_when(
      Open_Access_Status == 0 ~ "No Open Access",
      Open_Access_Status == 1 ~ "Open Access",
      TRUE ~ Open_Access_Type
    )
    
  ) %>% 
  select(-Open_Access_Status) %>% 
  group_by(Publication_Year, Open_Access_Type) %>% 
  summarise(
    statusCount = n()
  ) %>% 
  as.data.table() %>% 
  data.table :: dcast(
    Publication_Year ~ Open_Access_Type, value.var = "statusCount"
  ) %>% 
  tibble() %>% 
  mutate_all(
    ~replace_na(., 0)
  ) %>% 
  toJSON(., pretty = TRUE) %>%
  write("./oaData/oaTypePerYear.json")















