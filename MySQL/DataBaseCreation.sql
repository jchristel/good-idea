#this is for debug only...drop the schema if it already exists from previous runs
DROP SCHEMA IF EXISTS EventManager;
#create schema
CREATE SCHEMA EventManager;
# select the just created schema
USE EventManager;
# setup the projects database
CREATE TABLE Projects (
    ProjectID int NOT NULL AUTO_INCREMENT,
    ProjectName varchar(255) NOT NULL,
    PRIMARY KEY (ProjectID)
);
# setup the users database
CREATE TABLE Users (
    UserID int NOT NULL AUTO_INCREMENT,
    UserName varchar(255) NOT NULL,
    PRIMARY KEY (UserID)
);
# setup the design events database
CREATE TABLE DesignEvents (
    EventID int NOT NULL AUTO_INCREMENT,
    ProjectID int NOT NULL,
    EventName varchar(255) NOT NULL,
    EventDescription TEXT,
    ParentID int Not Null,
	Size int not null,
    OtherLinks TEXT,
    StartDateTime datetime not null,
    PRIMARY KEY (EventID),
    FOREIGN key (ProjectID) references Projects(ProjectID)
);
# setup the design events database
CREATE TABLE DesignEventsLog (
    LogID int NOT NULL AUTO_INCREMENT,
    UserID int NOT NULL,
    EventID int not null,
    StartDateTime datetime not null,
    EndDateTime datetime,
    PRIMARY KEY (LogID),
    FOREIGN key (UserID) references Users(UserID),
    FOREIGN key (EventID) references DesignEvents(EventID)
);

GRANT ALL PRIVILEGES ON EventManager . * TO 'dummyuser'@'localhost';
DROP user 'dummyuser'@'localhost' ;
#setup dummy user
CREATE USER 'dummyuser'@'localhost' IDENTIFIED BY 'dummy';
GRANT ALL PRIVILEGES ON EventManager . * TO 'dummyuser'@'localhost';

FLUSH PRIVILEGES;

#populate data tables
#projects
load data local infile 'C:/Git/DynamoNodes/DataAnalysis/MySQL/Table_Projects.csv' into table Projects fields terminated by ','
  enclosed by '"'
  lines terminated by '\n'
    (ProjectName);
#project events
load data local infile 'C:/Git/DynamoNodes/DataAnalysis/MySQL/DecisionTree_met.csv' into table designevents fields terminated by ','
  enclosed by '"'
  lines terminated by '\n'
  IGNORE 1 LINES
    (ProjectID,EventName,EventDescription,ParentID,Size,OtherLinks,StartDateTime);