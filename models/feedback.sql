CREATE TABLE feedback (
  	id int(11) AUTO_INCREMENT NOT NULL,
    _id int(25) not null,
    application_message text,
    feedback_message text not null,
    username varchar(64) not null,
    type varchar(16) not null
);