/** 
* EMAIL LIST
* Note: This table contains email addresses for a mailing list.
*/
create table email_list (
  -- Unique identifier for each email entry.
  id uuid default uuid_generate_v4() primary key,
  -- Email address of the subscriber.
  email text not null unique,
  -- Name of the subscriber.
  name text,
  -- Timestamp when the email was added to the list.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Set of key-value pairs, used to store additional information about the subscriber in a structured format.
  metadata jsonb
);

alter table email_list enable row level security;
create policy "Allow public read-only access." on email_list for select using (true);
create policy "Allow insert for all." on email_list for insert with check (true);