/** 
* RESULTS
* Note: This table stores the results of a user's completion of a practice section.
*/
create table results (
  -- Unique identifier for each result entry.
  id uuid default uuid_generate_v4() primary key,
  -- UUID of the user who completed the section.
  user_id uuid references auth.users not null,
  -- UUID of the section that was completed.
  section_id uuid references sections not null,
  -- The score the user achieved in the section.
  score integer not null,
  -- Timestamp when the result was recorded.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Set of key-value pairs, used to store additional information about the result in a structured format.
  metadata jsonb
);

alter table results enable row level security;
create policy "Can only view own results data." on results for select using (auth.uid() = user_id);
create policy "Can insert own results data." on results for insert with check (auth.uid() = user_id);