CREATE TABLE IF NOT EXISTS schedules (
    _id varchar(24) primary key not null,
    startDate date not null,
    endDate date not null,
    title varchar(128) not null,
    income int,
    typeIncome varchar(10),
    patients json not null,
    notes text,
    users json not null,
    date date not null,
    createdAt date not null,
);