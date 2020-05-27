#### Network data for sankey ####


if(!require(pacman)){
  install.packages("pacman")
}

pacman :: p_load(
  tidyverse,
  data.table,
  cbsodataR,
  jsonlite,
  install = TRUE
)

### here we want to create network data for the sankey to parse into a json

#### prepare publication data


# pubEx = read_csv2("http://p3.snf.ch/P3Export/P3_GrantExport.csv") %>% ### alternatively from the web
#   set_names(., str_replace_all(names(.), "\\s", "_")) 



pubEx = read_csv2("./input/P3_PublicationExport.csv") %>% 
  set_names(., str_replace_all(names(.), "\\s", "_")) 
pubEx = pubEx %>% ### more ore less same block as in publicationsPerYear.R
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
    ),
    
    publication = rep("publication", nrow(.))
    
  ) %>% 
  select(
    publication,
    Publication_Year,
    Open_Access_Status,
    Open_Access_Type
  ) 

  

edges = NULL

### here we want to get network data to see how many publicaitons "point" into the direction of which access type

for(i in unique(pubEx$Publication_Year)){### loop through each year to get it yearwise for the sankey

  
  year = i
  print(paste("start:", i))
  
  pubTemp = pubEx %>%
    filter(Publication_Year == i) %>% 
    mutate(
      Open_Access_Type = str_replace(Open_Access_Type, "No Open.+", NA_character_)
    )

  # print(pubTemp)

  values1st = pubTemp %>%
    group_by(publication, Open_Access_Status) %>%
    summarise(
     value = n()### count the amount of publications
    ) %>%
    ungroup() %>% 
    select(source = publication, target = Open_Access_Status, value)### give some names to put it into the js
  
  
  values2nd = pubTemp %>%
    group_by(Open_Access_Status, Open_Access_Type) %>%
    summarise(
      value = n()
    ) %>%
    ungroup() %>% 
    select(source = Open_Access_Status, target = Open_Access_Type, value)
  
  
  edgesTemp = rbind(values1st, values2nd) %>% 
    tibble() %>% 
    filter(!is.na(target)) %>% 
    mutate(year = rep(i, nrow(.)))

  edges = edges %>% 
    rbind(., edgesTemp)

}

edges = edges %>% 
  mutate_at(
    vars(value),
    ~as.character(.)
  )


nodes = c(unique(edges$source), unique(edges$target)) %>% tibble(name = .) %>% 
  distinct()


###create a list, which is the R equivalent of hiearchical data and parse it simply to a json

list(links = edges, nodes = nodes) %>% toJSON(., pretty = TRUE) %>% write("networkData.json") #### parsing the data to json for easier "ingestion"













