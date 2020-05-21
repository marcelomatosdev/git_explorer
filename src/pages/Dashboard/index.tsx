import React, { useState, useEffect, FormEvent } from 'react';
import { FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import logoimg from '../../assets/logo.svg';
import { Title, Form, Repositories, Error } from './styles';
import api from '../../services/api';
// import Repository from '../Repository';

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepositories = localStorage.getItem(
      '@GithubExplorer:repositories',
    );

    if (storagedRepositories) {
      return JSON.parse(storagedRepositories);
    }
    return [];
  });
  const [newRepo, setNewRepo] = useState('');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    try {
      event.preventDefault();
      if (!newRepo) {
        setInputError('Please inform owner/repository');
        return;
      }
      const response = await api.get<Repository>(`repos/${newRepo}`);

      const repository = response.data;
      setRepositories([...repositories, repository]);
      setInputError('');
      setNewRepo('');
    } catch (err) {
      setInputError('Owner/repository not found');
    }
  }

  async function handleRemoveRepository(fullName: string): Promise<void> {
    // const response = await api.delete(`repositories/${fullName}`);
    console.log(fullName);
    const newRepositories = repositories.filter(
      (repository) => !repository.full_name.includes(fullName),
    );

    setRepositories(newRepositories);
  }

  return (
    <>
      <img src={logoimg} alt="Github Explorer" />
      <Title>Explore Github repositories</Title>

      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={newRepo}
          onChange={(e) => setNewRepo(e.target.value)}
          placeholder="Type the name of the repository.  E.g. facebook/react"
        />
        <button type="submit">Search</button>
      </Form>
      {inputError && <Error>{inputError}</Error>}
      <Repositories>
        {repositories.map((repository) => (
          <div key={repository.full_name} id="container">
            <Link to={`/repositories/${repository.full_name}`}>
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />
              <div>
                <strong>{repository.full_name}</strong>
                <p>{repository.description}</p>
              </div>
              <FiChevronRight size={20} />
            </Link>
            <FiTrash2
              type="button"
              onClick={() => handleRemoveRepository(repository.full_name)}
            />
          </div>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
