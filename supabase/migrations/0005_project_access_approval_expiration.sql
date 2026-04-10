create or replace function public.get_project_access_status(
  p_project_id text,
  p_visitor_token text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  normalized_project_id text := trim(coalesce(p_project_id, ''));
  normalized_visitor_token text := trim(coalesce(p_visitor_token, ''));
  latest_request public.project_access_requests%rowtype;
  approval_window interval := interval '30 days';
  request_has_access boolean := false;
begin
  if normalized_project_id = '' or normalized_visitor_token = '' then
    return jsonb_build_object(
      'has_access', false,
      'latest_status', null,
      'request_id', null
    );
  end if;

  select *
  into latest_request
  from public.project_access_requests
  where project_id = normalized_project_id
    and visitor_token = normalized_visitor_token
  order by created_at desc
  limit 1;

  request_has_access := coalesce(
    latest_request.status = 'approved'
    and coalesce(latest_request.reviewed_at, latest_request.updated_at, latest_request.created_at) + approval_window > timezone('utc', now()),
    false
  );

  return jsonb_build_object(
    'has_access', request_has_access,
    'latest_status', latest_request.status,
    'request_id', latest_request.id
  );
end;
$$;

create or replace function public.submit_project_access_request(
  p_project_id text,
  p_requester_name text,
  p_requester_email text,
  p_requester_message text,
  p_visitor_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_project_id text := trim(coalesce(p_project_id, ''));
  normalized_requester_name text := trim(coalesce(p_requester_name, ''));
  normalized_requester_email text := lower(trim(coalesce(p_requester_email, '')));
  normalized_requester_message text := trim(coalesce(p_requester_message, ''));
  normalized_visitor_token text := trim(coalesce(p_visitor_token, ''));
  existing_request public.project_access_requests%rowtype;
  created_request public.project_access_requests%rowtype;
  approval_window interval := interval '30 days';
  existing_request_has_access boolean := false;
begin
  if normalized_project_id = '' then
    raise exception 'Projeto invalido para solicitar acesso.';
  end if;

  if normalized_requester_name = '' then
    raise exception 'Informe seu nome para solicitar acesso.';
  end if;

  if normalized_requester_email = '' or normalized_requester_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Informe um e-mail valido para solicitar acesso.';
  end if;

  if normalized_requester_message = '' then
    raise exception 'Escreva uma mensagem para solicitar acesso.';
  end if;

  if normalized_visitor_token = '' then
    raise exception 'Identificador do visitante ausente.';
  end if;

  if char_length(normalized_requester_name) > 140 then
    raise exception 'O nome informado excede o limite permitido.';
  end if;

  if char_length(normalized_requester_email) > 320 then
    raise exception 'O e-mail informado excede o limite permitido.';
  end if;

  if char_length(normalized_requester_message) > 4000 then
    raise exception 'A mensagem excede o limite permitido.';
  end if;

  if char_length(normalized_visitor_token) > 200 then
    raise exception 'Identificador do visitante invalido.';
  end if;

  perform 1
  from public.projects
  where id = normalized_project_id
    and status = 'published'
    and coalesce(trim(password), '') <> '';

  if not found then
    raise exception 'Este projeto nao aceita solicitacoes de acesso no momento.';
  end if;

  select *
  into existing_request
  from public.project_access_requests
  where project_id = normalized_project_id
    and visitor_token = normalized_visitor_token
    and lower(requester_email) = normalized_requester_email
  order by created_at desc
  limit 1;

  existing_request_has_access := coalesce(
    existing_request.status = 'approved'
    and coalesce(existing_request.reviewed_at, existing_request.updated_at, existing_request.created_at) + approval_window > timezone('utc', now()),
    false
  );

  if existing_request.id is not null and (existing_request.status = 'pending' or existing_request_has_access) then
    return jsonb_build_object(
      'created', false,
      'has_access', existing_request_has_access,
      'latest_status', existing_request.status,
      'request_id', existing_request.id,
      'request', to_jsonb(existing_request)
    );
  end if;

  insert into public.project_access_requests (
    project_id,
    requester_name,
    requester_email,
    requester_message,
    visitor_token,
    status
  ) values (
    normalized_project_id,
    normalized_requester_name,
    normalized_requester_email,
    normalized_requester_message,
    normalized_visitor_token,
    'pending'
  )
  returning *
  into created_request;

  return jsonb_build_object(
    'created', true,
    'has_access', false,
    'latest_status', created_request.status,
    'request_id', created_request.id,
    'request', to_jsonb(created_request)
  );
end;
$$;
